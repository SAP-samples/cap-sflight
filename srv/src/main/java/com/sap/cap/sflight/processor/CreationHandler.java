package com.sap.cap.sflight.processor;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.BookingSupplement;
import cds.gen.travelservice.BookingSupplement_;
import cds.gen.travelservice.DraftActivateContext;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.TravelStatus;
import cds.gen.travelservice.Travel_;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import org.springframework.stereotype.Component;

import static cds.gen.travelservice.TravelService_.TRAVEL;

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

	@Before(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE }, entity = Travel_.CDS_NAME)
	public void setBookingDateIfNotProvided(final Travel travel) {
		if (travel.getToBooking() != null) {
			for (Booking booking : travel.getToBooking()) {
				if (booking.getBookingDate() == null) {
					booking.setBookingDate(LocalDate.now());
				}
			}
		}
	}

	@On(event = DraftService.EVENT_DRAFT_SAVE, entity = Travel_.CDS_NAME)
	public void saveComputedValues(DraftActivateContext ctx) {
		draftService.run(ctx.getCqn()).first().ifPresent(travelDraftRow -> {
			Travel travelDraft = travelDraftRow.as(Travel.class);
			Map<String, Object> data = new HashMap<>();
			data.put("TravelUUID", travelDraft.getTravelUUID());
			data.put("IsActiveEntity", true);
			data.put("TotalPrice", travelDraft.getTotalPrice());
			data.put("TravelStatus_code", travelDraft.getTravelStatusCode());
			persistenceService.run(Update.entity(Travel_.class).data(data));
		});
	}

	@Before(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE }, entity = Travel_.CDS_NAME)
	public void checkTravelEndDateIsAfterBeginDate(Travel travel) {

		if (travel.getBeginDate() != null && travel.getEndDate() != null) {
			if (travel.getBeginDate().isAfter(travel.getEndDate())) {
				throw new IllegalTravelDateException(
						"Travel with travelID {} has illegal " + "travel dates. End date {} is before begin date {}.",
						travel.getTravelID(), travel.getBeginDate(), travel.getEndDate());
			}

			if (travel.getBeginDate().isBefore(LocalDate.now().atStartOfDay().toLocalDate())) {
				throw new IllegalTravelDateException(
						"Travel with travelID {} has illegal travel " + "dates: Begin date {} must not be in the past.",
						travel.getTravelID(), travel.getBeginDate());
			}
		}

	}

	@On(event = CdsService.EVENT_CREATE, entity = Travel_.CDS_NAME)
	public void calculateTravelIdBeforeCreation(final Travel travel) {
		if (travel.getTravelID() == null || travel.getTravelID() == 0) {
			Select<Travel_> maxIdSelect = Select.from(TRAVEL).columns(e -> e.TravelID().max().as(MAX_ID));
			Integer currentMaxId = (Integer) persistenceService.run(maxIdSelect).first().map(maxId -> maxId.get(MAX_ID))
					.orElse(0);
			travel.setTravelID(++currentMaxId);
		}

	}

	@On(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE, }, entity = Travel_.CDS_NAME)
	public void fillBookingIdsAferCreationAndUpdate(final Travel travel) {
		if (travel.getToBooking() != null) {
			addBookingIdsToBookings(travel);
		}
	}

	private void addBookingIdsToBookings(Travel travel) {
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
