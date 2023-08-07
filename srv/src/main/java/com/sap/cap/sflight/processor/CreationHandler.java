package com.sap.cap.sflight.processor;


import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.BookingSupplement;
import cds.gen.travelservice.BookingSupplement_;
import cds.gen.travelservice.DraftActivateContext;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.TravelStatus;
import cds.gen.travelservice.Travel_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class CreationHandler implements EventHandler {
	private static final String MAX_ID = "maxId";

	private final PersistenceService persistenceService;
	private final DraftService draftService;

	public CreationHandler(PersistenceService persistenceService, DraftService draftService) {
		this.persistenceService = persistenceService;
		this.draftService = draftService;
	}

	@Before(event = { CqnService.EVENT_CREATE, CqnService.EVENT_UPDATE, DraftService.EVENT_DRAFT_CREATE}, entity = Travel_.CDS_NAME)
	public void setBookingDateIfNotProvided(final Travel travel) {
		if (travel.beginDate() == null) {
			travel.beginDate(LocalDate.now());
		}

		if (travel.endDate() == null) {
			travel.endDate(LocalDate.now().plusDays(1));
		}

		if (travel.toBooking() != null) {
			for (Booking booking : travel.toBooking()) {
				if (booking.bookingDate() == null) {
					booking.bookingDate(LocalDate.now());
				}
			}
		}
	}

	@Before(event = DraftService.EVENT_DRAFT_SAVE, entity = Travel_.CDS_NAME)
	public void saveComputedValues(DraftActivateContext ctx) {

		/*
		* Elements annotated with @Core.computed are not transferred during
		* DRAFT_SAVE. Normally, we'd re-compute the @Core.computed values after
		* DRAFT_SAVE and store them to the active version. For the TravelStatus_code
		* this is not possible as they originate as the result of a custom action
		* and thus cannot be re-computed. We have to take them from the draft version and
		* store them to the active version *before* the DRAFT_SAVE event.
		*/
		draftService.run(ctx.cqn()).first(Travel.class).ifPresent(travelDraft -> {
			Map<String, Object> data = new HashMap<>();
			data.put(Travel.TRAVEL_UUID, travelDraft.travelUUID());
			data.put(Travel.IS_ACTIVE_ENTITY, true);
			data.put(Travel.TRAVEL_STATUS_CODE , travelDraft.travelStatusCode());
			persistenceService.run(Update.entity(Travel_.class).data(data));
		});
	}

	@Before(event = { CqnService.EVENT_CREATE, CqnService.EVENT_UPDATE }, entity = Travel_.CDS_NAME)
	public void checkTravelEndDateIsAfterBeginDate(Travel travel) {

		if (travel.beginDate() != null && travel.endDate() != null) {
			if (travel.beginDate().isAfter(travel.endDate())) {
				throw new IllegalTravelDateException("error.travel.date.illegal", travel.travelID(),
						travel.beginDate(), travel.endDate());
			}

			if (travel.beginDate().isBefore(LocalDate.now().atStartOfDay().toLocalDate())) {
				throw new IllegalTravelDateException("error.travel.date.past", travel.travelID(),
						travel.beginDate());
			}
		}
	}

	@Before(event = CqnService.EVENT_CREATE, entity = Travel_.CDS_NAME)
	public void calculateTravelIdBeforeCreation(final Travel travel) {
		if (travel.travelID() == null || travel.travelID() == 0) {
			Select<Travel_> maxIdSelect = Select.from(TravelService_.TRAVEL).columns(e -> e.TravelID().max().as(MAX_ID));
			Integer currentMaxId = (Integer) persistenceService.run(maxIdSelect).first().map(maxId -> maxId.get(MAX_ID))
					.orElse(0);
			travel.travelID(++currentMaxId);
		}
	}

	@Before(event = { CqnService.EVENT_CREATE, CqnService.EVENT_UPDATE, }, entity = Travel_.CDS_NAME)
	public void fillBookingIdsBeforeCreationAndUpdate(final Travel travel) {
		if (travel.toBooking() != null) {
			addBookingIds(travel);
			addBookingSupplementIds(travel);
		}
	}

	private void addBookingSupplementIds(Travel travel) {

		travel.toBooking().stream()
				.filter(booking -> booking.toBookSupplement() != null && !booking.toBookSupplement().isEmpty())
				.forEach(booking -> {
					List<BookingSupplement> bookingSupplements = booking.toBookSupplement();

					List<BookingSupplement> bookingSupplementsWithoutIds = bookingSupplements.stream()
							.filter(bookingSupplement -> bookingSupplement.bookingSupplementID() == null
									|| bookingSupplement.bookingSupplementID() == 0)
							.collect(Collectors.toList());

					Integer currentMaxBookingSupplementId = bookingSupplements.stream()
							.filter(bs -> Objects.nonNull(bs.bookingSupplementID()))
							.max(Comparator.comparing(BookingSupplement::bookingSupplementID))
							.map(BookingSupplement::bookingSupplementID).orElse(0);

					for (BookingSupplement bookingSupplement : bookingSupplementsWithoutIds) {
						bookingSupplement.bookingSupplementID(++currentMaxBookingSupplementId);
					}
				});
	}

	private void addBookingIds(Travel travel) {
		List<Booking> bookingsWithoutId = travel.toBooking().stream()
				.filter(booking -> booking.bookingID() == null || booking.bookingID() == 0)
				.collect(Collectors.toList());

		Integer currentMaxBookingId = travel.toBooking().stream()
				.filter(booking -> Objects.nonNull(booking.bookingID()))
				.max(Comparator.comparing(Booking::bookingID)).map(Booking::bookingID).orElse(0);

		for (Booking booking : bookingsWithoutId) {
			booking.bookingID(++currentMaxBookingId);
		}
	}

	@Before(event = CqnService.EVENT_CREATE, entity = Travel_.CDS_NAME)
	public void initialTravelStatus(final Travel travel) {
		TravelStatus travelStatus = TravelStatus.create();
		travelStatus.code("O");
		travel.travelStatus(travelStatus);
	}

	@Before(event = DraftService.EVENT_DRAFT_NEW, entity = Travel_.CDS_NAME)
	public void initialTravelId(final Travel travel) {
		travel.travelID(0);
	}

	@Before(event = DraftService.EVENT_DRAFT_NEW, entity = BookingSupplement_.CDS_NAME)
	public void initialBookingSupplementId(final BookingSupplement bookingSupplement) {
		if (bookingSupplement.bookingSupplementID() == null) {
			bookingSupplement.bookingSupplementID(0);
		}
	}
}
