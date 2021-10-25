package com.sap.cap.sflight.processor;


import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;

import org.springframework.stereotype.Component;

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

	@Before(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE, DraftService.EVENT_DRAFT_CREATE}, entity = Travel_.CDS_NAME)
	public void setBookingDateIfNotProvided(final Travel travel) {
		if (travel.getBeginDate() == null) {
			travel.setBeginDate(LocalDate.now());
		}

		if (travel.getEndDate() == null) {
			travel.setEndDate(LocalDate.now().plusDays(1));
		}

		if (travel.getToBooking() != null) {
			for (Booking booking : travel.getToBooking()) {
				if (booking.getBookingDate() == null) {
					booking.setBookingDate(LocalDate.now());
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
		draftService.run(ctx.getCqn()).first(Travel.class).ifPresent(travelDraft -> {
			Map<String, Object> data = new HashMap<>();
			data.put(Travel.TRAVEL_UUID, travelDraft.getTravelUUID());
			data.put(Travel.IS_ACTIVE_ENTITY, true);
			data.put(Travel.TRAVEL_STATUS_CODE , travelDraft.getTravelStatusCode());
			persistenceService.run(Update.entity(Travel_.class).data(data));
		});
	}

	@Before(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE }, entity = Travel_.CDS_NAME)
	public void checkTravelEndDateIsAfterBeginDate(Travel travel) {

		if (travel.getBeginDate() != null && travel.getEndDate() != null) {
			if (travel.getBeginDate().isAfter(travel.getEndDate())) {
				throw new IllegalTravelDateException("error.travel.date.illegal", travel.getTravelID(),
						travel.getBeginDate(), travel.getEndDate());
			}

			if (travel.getBeginDate().isBefore(LocalDate.now().atStartOfDay().toLocalDate())) {
				throw new IllegalTravelDateException("error.travel.date.past", travel.getTravelID(),
						travel.getBeginDate());
			}
		}
	}

	@Before(event = CdsService.EVENT_CREATE, entity = Travel_.CDS_NAME)
	public void calculateTravelIdBeforeCreation(final Travel travel) {
		if (travel.getTravelID() == null || travel.getTravelID() == 0) {
			Select<Travel_> maxIdSelect = Select.from(TravelService_.TRAVEL).columns(e -> e.TravelID().max().as(MAX_ID));
			Integer currentMaxId = (Integer) persistenceService.run(maxIdSelect).first().map(maxId -> maxId.get(MAX_ID))
					.orElse(0);
			travel.setTravelID(++currentMaxId);
		}
	}

	@Before(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE, }, entity = Travel_.CDS_NAME)
	public void fillBookingIdsBeforeCreationAndUpdate(final Travel travel) {
		if (travel.getToBooking() != null) {
			addBookingIds(travel);
			addBookingSupplementIds(travel);
		}
	}

	private void addBookingSupplementIds(Travel travel) {

		travel.getToBooking().stream()
				.filter(booking -> booking.getToBookSupplement() != null && !booking.getToBookSupplement().isEmpty())
				.forEach(booking -> {
					List<BookingSupplement> bookingSupplements = booking.getToBookSupplement();

					List<BookingSupplement> bookingSupplementsWithoutIds = bookingSupplements.stream()
							.filter(bookingSupplement -> bookingSupplement.getBookingSupplementID() == null
									|| bookingSupplement.getBookingSupplementID() == 0)
							.collect(Collectors.toList());

					Integer currentMaxBookingSupplementId = bookingSupplements.stream()
							.filter(bs -> Objects.nonNull(bs.getBookingSupplementID()))
							.max(Comparator.comparing(BookingSupplement::getBookingSupplementID))
							.map(BookingSupplement::getBookingSupplementID).orElse(0);

					for (BookingSupplement bookingSupplement : bookingSupplementsWithoutIds) {
						bookingSupplement.setBookingSupplementID(++currentMaxBookingSupplementId);
					}
				});
	}

	private void addBookingIds(Travel travel) {
		List<Booking> bookingsWithoutId = travel.getToBooking().stream()
				.filter(booking -> booking.getBookingID() == null || booking.getBookingID() == 0)
				.collect(Collectors.toList());

		Integer currentMaxBookingId = travel.getToBooking().stream()
				.filter(booking -> Objects.nonNull(booking.getBookingID()))
				.max(Comparator.comparing(Booking::getBookingID)).map(Booking::getBookingID).orElse(0);

		for (Booking booking : bookingsWithoutId) {
			booking.setBookingID(++currentMaxBookingId);
		}
	}

	@Before(event = CdsService.EVENT_CREATE, entity = Travel_.CDS_NAME)
	public void initialTravelStatus(final Travel travel) {
		TravelStatus travelStatus = TravelStatus.create();
		travelStatus.setCode("O");
		travel.setTravelStatus(travelStatus);
	}

	@Before(event = DraftService.EVENT_DRAFT_NEW, entity = Travel_.CDS_NAME)
	public void initialTravelId(final Travel travel) {
		travel.setTravelID(0);
	}

	@Before(event = DraftService.EVENT_DRAFT_NEW, entity = BookingSupplement_.CDS_NAME)
	public void initialBookingSupplementId(final BookingSupplement bookingSupplement) {
		if (bookingSupplement.getBookingSupplementID() == null) {
			bookingSupplement.setBookingSupplementID(0);
		}
	}
}
