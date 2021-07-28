package com.sap.cap.sflight.processor;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.BookingSupplement;
import cds.gen.travelservice.BookingSupplement_;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import static cds.gen.travelservice.TravelService_.BOOKING;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import cds.gen.travelservice.TravelStatus;
import cds.gen.travelservice.Travel_;
import com.sap.cds.Row;
import com.sap.cds.ql.Select;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class CreationHandler implements EventHandler {
	private static final String MAX_ID = "maxId";
	private static final String TRAVEL_UUID = "travelUUID";

	private final PersistenceService cdsService;
	private final DraftService draftService;

	public CreationHandler(PersistenceService cdsService, DraftService draftService) {
		this.cdsService = cdsService;
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

	@On(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE, DraftService.EVENT_DRAFT_NEW,
			DraftService.EVENT_DRAFT_PATCH }, entity = Travel_.CDS_NAME)
	public void calculateTravelIdBeforeCreation(final Travel travel) {
		if (travel.getTravelID() == null || travel.getTravelID() == 0) {
			Select<Travel_> maxIdSelect = Select.from(TRAVEL).columns(e -> e.TravelID().max().as(MAX_ID));

			Optional<Row> maxIdResult = cdsService.run(maxIdSelect).first();

			Integer currentMaxId = (Integer) maxIdResult.map(maxId -> maxId.get(MAX_ID)).orElse(0);

			travel.setTravelID(currentMaxId + 1);

			if (travel.getToBooking() != null) {
				for (Booking booking : travel.getToBooking()) {
					if (booking.getBookingID() == null || booking.getBookingID() == 0) {
						booking.setBookingID(getMaxBookingId(booking.getBookingUUID(),
								booking.getIsActiveEntity() == null || booking.getIsActiveEntity()));
					}
				}
			}
		}

	}

	@On(event = { DraftService.EVENT_DRAFT_NEW, DraftService.EVENT_DRAFT_PATCH }, entity = Booking_.CDS_NAME)
	public void calculateBookingIdBeforeCreation(final Booking booking) {
		if (booking.getBookingUUID() == null) { // booking is still very empty. can't calculate from that
			return;
		}

		draftService.run(Select.from(BOOKING).columns(Booking_::BookingID)
				.where(b -> b.BookingUUID().eq(booking.getBookingUUID()))).first()
				.ifPresent(row -> booking.setBookingID((Integer) row.get("BookingID")));

		if (booking.getBookingID() == 0) {
			booking.setBookingID(getMaxBookingId(booking.getBookingUUID(), booking.getIsActiveEntity()));
		}
	}

	private int getMaxBookingId(String bookingUUID, boolean isActiveEntity) {
		Select<Booking_> bookingSelect = Select.from(BOOKING)
				.where(bs -> bs.BookingUUID().eq(bookingUUID).and(bs.IsActiveEntity().eq(isActiveEntity)));

		Optional<Row> firstRow;
		if (isActiveEntity) {
			firstRow = cdsService.run(bookingSelect).first();
		} else {
			firstRow = draftService.run(bookingSelect).first();
		}

		if (firstRow.isPresent()) {
			var bookingData = firstRow.get().as(Booking.class);
			if (bookingData.getBookingID() == null || bookingData.getBookingID() == 0) {
				Select<Booking_> maxIdSelect = Select.from(BOOKING).columns(e -> e.BookingID().max().as(MAX_ID))
						.groupBy(Booking.TO_TRAVEL_TRAVEL_UUID)
						.having(b -> b.to_Travel_TravelUUID().eq(bookingData.getToTravelTravelUUID())
								.and(b.IsActiveEntity().eq(isActiveEntity)));

				if (isActiveEntity) {
					return (Integer) cdsService.run(maxIdSelect).first().map(maxId -> maxId.get(MAX_ID)).orElse(0) + 1;
				} else {
					return (Integer) draftService.run(maxIdSelect).first().map(maxId -> maxId.get(MAX_ID)).orElse(0) + 1;
				}
			} else {
				return bookingData.getBookingID();
			}
		}
		return 1;
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

	@Before(event = DraftService.EVENT_DRAFT_NEW, entity = Booking_.CDS_NAME)
	public void initialBookingId(final Booking booking) {
		if (booking.getBookingID() == null) {
			booking.setBookingID(0);
		}
	}

	@Before(event = DraftService.EVENT_DRAFT_NEW, entity = BookingSupplement_.CDS_NAME)
	public void initialBookingSupplementId(final BookingSupplement bookingSupplement) {
		if (bookingSupplement.getBookingSupplementID() == null) {
			bookingSupplement.setBookingSupplementID(0);
		}
	}

}
