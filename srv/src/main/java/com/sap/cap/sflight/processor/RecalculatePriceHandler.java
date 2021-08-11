package com.sap.cap.sflight.processor;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.BookingSupplement;
import cds.gen.travelservice.BookingSupplement_;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import org.springframework.stereotype.Component;

import static cds.gen.travelservice.TravelService_.BOOKING;
import static cds.gen.travelservice.TravelService_.BOOKING_SUPPLEMENT;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import static com.sap.cds.ql.CQL.sum;
import static java.lang.Boolean.FALSE;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class RecalculatePriceHandler implements EventHandler {

	private static final String TRAVEL_UUID = "travelUUID";
	private final DraftService draftService;
	private final PersistenceService persistenceService;

	public RecalculatePriceHandler(DraftService draftService, PersistenceService persistenceService) {
		this.draftService = draftService;
		this.persistenceService = persistenceService;
	}

	private static BigDecimal calculateTotalPriceForTravel(CqnService db, String travelUUID, boolean isActiveEntity) {
		// get booking fee
		var bookingFee = BigDecimal.valueOf(0);
		var bookingFeeRow = db.run(Select.from(TRAVEL).columns(Travel_::BookingFee)
				.where(t -> t.TravelUUID().eq(travelUUID).and(t.IsActiveEntity().eq(isActiveEntity))
						.and(t.BookingFee().isNotNull())).limit(1)).first();
		if (bookingFeeRow.isPresent()) {
			bookingFee = (BigDecimal) bookingFeeRow.get().get("BookingFee");
		}

		// get sum of flightprices from all bookings
		var flightPriceSum = new BigDecimal(0);
		var flighPriceRow = db.run(Select.from(BOOKING).columns(c -> sum(c.FlightPrice()).as("FlightPriceSum"))
						.groupBy(c -> c.get("to_Travel.TravelUUID"))
						.having(c -> c.to_Travel().TravelUUID().eq(travelUUID).and(c.IsActiveEntity().eq(isActiveEntity))))
				.first();

		if (flighPriceRow.isPresent() && flighPriceRow.get().size() > 0) {
			flightPriceSum = new BigDecimal(flighPriceRow.get().get("FlightPriceSum").toString());
		}

		// get sum of the prices of all bookingsupplements for the travel
		var supplementPriceSum = new BigDecimal(0);
		var supplmentPriceSumRow = db.run(Select.from(BOOKING_SUPPLEMENT).columns(c -> sum(c.Price()).as("PriceSum"))
						.groupBy(c -> c.get("to_Booking.to_Travel.TravelUUID"))
						.having(c -> c.to_Travel().TravelUUID().eq(travelUUID).and(c.IsActiveEntity().eq(isActiveEntity))))
				.first();
		if (supplmentPriceSumRow.isPresent() && supplmentPriceSumRow.get().size() > 0) {
			supplementPriceSum = new BigDecimal(supplmentPriceSumRow.get().get("PriceSum").toString());
		}

		// update travel's total price
		return bookingFee.add(flightPriceSum).add(supplementPriceSum);
	}

	@After(event = CdsService.EVENT_UPDATE, entity = Travel_.CDS_NAME)
	public void calculateNewTotalPriceForActiveTravel(Travel travel) {
		String travelUUID = travel.getTravelUUID();
		if (travelUUID.isEmpty()) {
			return;
		}
		travel.setTotalPrice(calculateTotalPriceForTravel(persistenceService, travelUUID, true));

		Map<String, Object> data = new HashMap<>();
		data.put("TotalPrice", travel.getTotalPrice());
		data.put("TravelUUID", travelUUID);
		persistenceService.run(Update.entity(TRAVEL).data(data));
	}

	@After(event = { DraftService.EVENT_DRAFT_PATCH }, entity = Travel_.CDS_NAME)
	public void recalculateTravelPriceIfTravelWasUpdated(final Travel travel) {
		if (travel.getTravelUUID() != null && travel.getBookingFee() != null) { // only for patched booking fee
			String travelUUID = travel.getTravelUUID();
			travel.setTotalPrice(calculateNewTotalPriceForDraft(travelUUID));
		}
	}

	@After(event = { DraftService.EVENT_DRAFT_PATCH, DraftService.EVENT_DRAFT_NEW }, entity = Booking_.CDS_NAME)
	public void recalculateTravelPriceIfFlightPriceWasUpdated(final Booking booking) {
		draftService.run(Select.from(BOOKING).columns(bs -> bs.get("to_Travel.TravelUUID").as(TRAVEL_UUID))
						.where(bs -> bs.BookingUUID().eq(booking.getBookingUUID()).and(bs.IsActiveEntity().eq(FALSE)))).first()
				.ifPresent(row -> calculateNewTotalPriceForDraft((String) row.get(TRAVEL_UUID)));
	}

	@After(event = { DraftService.EVENT_DRAFT_NEW, DraftService.EVENT_DRAFT_PATCH,
			DraftService.EVENT_DRAFT_SAVE }, entity = BookingSupplement_.CDS_NAME)
	public void recalculateTravelPriceIfPriceWasUpdated(final BookingSupplement bookingSupplement) {
		draftService.run(
						Select.from(BOOKING_SUPPLEMENT).columns(bs -> bs.get("to_Booking.to_Travel.TravelUUID").as(TRAVEL_UUID))
								.where(bs -> bs.BookSupplUUID().eq(bookingSupplement.getBookSupplUUID())
										.and(bs.IsActiveEntity().eq(FALSE)))).first()
				.ifPresent(row -> calculateNewTotalPriceForDraft((String) row.get(TRAVEL_UUID)));
	}

	private BigDecimal calculateNewTotalPriceForDraft(final String travelUUID) {

		BigDecimal totalPrice = calculateTotalPriceForTravel(draftService, travelUUID, false);
		var update = Update.entity(TRAVEL).data(Map.of("TravelUUID", travelUUID, "TotalPrice", totalPrice));
		draftService.patchDraft(update);
		return totalPrice;
	}

}
