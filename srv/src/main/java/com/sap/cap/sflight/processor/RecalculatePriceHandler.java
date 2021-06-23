package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.BOOKING;
import static cds.gen.travelservice.TravelService_.BOOKING_SUPPLEMENT;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import static com.sap.cds.ql.CQL.sum;
import static java.lang.Boolean.FALSE;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.BookingSupplement;
import cds.gen.travelservice.BookingSupplement_;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class RecalculatePriceHandler implements EventHandler {

	private static final String TRAVEL_UUID = "travelUUID";
	private final DraftService db;

	public RecalculatePriceHandler(DraftService db) {
		this.db = db;
	}

	@After(event = DraftService.EVENT_DRAFT_PATCH, entity = Travel_.CDS_NAME)
	public void recalculatePriceOnBookingFeeChange(final Travel travel) {
		if (travel.getTotalPrice() == null) {
			recalculateAndApplyPriceOnBookingChange(travel.getTravelUUID(), false);
		}
	}

	@After(event = { DraftService.EVENT_DRAFT_PATCH, DraftService.EVENT_DRAFT_NEW }, entity = Booking_.CDS_NAME)
	public void recalculateTravelPriceIfFlightPriceWasUpdated(final Booking booking) {
		var travelUUID = (String) db
				.run(Select.from(BOOKING).columns(bs -> bs.get("to_Travel.TravelUUID").as(TRAVEL_UUID))
						.where(bs -> bs.BookingUUID().eq(booking.getBookingUUID()).and(bs.IsActiveEntity().eq(FALSE))))
				.single().get(TRAVEL_UUID);

		recalculateAndApplyPriceOnBookingChange(travelUUID, false);
	}

	@After(event = { DraftService.EVENT_DRAFT_NEW, DraftService.EVENT_DRAFT_PATCH,
			DraftService.EVENT_DRAFT_SAVE }, entity = BookingSupplement_.CDS_NAME)
	public void recalculateTravelPriceIfPriceWasUpdated(final BookingSupplement bookingSupplement) {
		var travelUUID = (String) db.run(Select.from(BOOKING_SUPPLEMENT)
				.columns(bs -> bs.get("to_Booking.to_Travel.TravelUUID").as(TRAVEL_UUID)).where(bs -> bs.BookSupplUUID()
						.eq(bookingSupplement.getBookSupplUUID()).and(bs.IsActiveEntity().eq(FALSE))))
				.single().get(TRAVEL_UUID);
		recalculateAndApplyPriceOnBookingChange(travelUUID, false);
	}

	@Before(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE }, entity = Travel_.CDS_NAME)
	public void recalculateTravelBeforeCreateAndUpdate(final Travel travel) {
		travel.setTotalPrice(calculatePriceFromTravelObject(travel));
	}

	private void recalculateAndApplyPriceOnBookingChange(final String travelUUID, boolean isActiveEntity) {

		BigDecimal totalPrice = calculateTotalPriceForTravel(travelUUID, isActiveEntity);
		var update = Update.entity(TRAVEL).data(Map.of("TravelUUID", travelUUID, "TotalPrice", totalPrice));
		if (isActiveEntity) {
			db.run(update);
		} else {
			db.patchDraft(update);
		}
	}

	private BigDecimal calculatePriceFromTravelObject(final Travel travel) {
		BigDecimal flightPriceSum = travel.getToBooking().stream().map(Booking::getFlightPrice).reduce(BigDecimal.ZERO,
				BigDecimal::add);
		BigDecimal supplementPriceSum = BigDecimal.ZERO;
		for (Booking booking : travel.getToBooking()) {
			supplementPriceSum = supplementPriceSum.add(booking.getToBookSupplement().stream()
					.map(BookingSupplement::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add));
		}

		return travel.getBookingFee().add(flightPriceSum).add(supplementPriceSum);
	}

	private BigDecimal calculateTotalPriceForTravel(String travelUUID, boolean isActiveEntity) {
		// get booking fee
		var bookingFee = BigDecimal.valueOf(0);
		var bookingFeeRow = db.run(Select.from(TRAVEL).columns(Travel_::BookingFee).where(t -> t.TravelUUID()
				.eq(travelUUID).and(t.IsActiveEntity().eq(isActiveEntity)).and(t.BookingFee().isNotNull())).limit(1))
				.first();
		if (bookingFeeRow.isPresent()) {
			bookingFee = (BigDecimal) bookingFeeRow.get().get("BookingFee");
		}

		// get sum of flightprices from all bookings
		var flightPriceSum = new BigDecimal(0);
		var flighPriceRow = db.run(Select.from(BOOKING).columns(c -> sum(c.FlightPrice()).as("FlightPriceSum"))
				.groupBy(c -> c.get("to_Travel.TravelUUID"))
				.having(c -> c.to_Travel().TravelUUID().eq(travelUUID).and(c.IsActiveEntity().eq(isActiveEntity))))
				.first();
		if (flighPriceRow.isPresent()) {
			flightPriceSum = new BigDecimal(flighPriceRow.get().get("FlightPriceSum").toString());
		}

		// get sum of the prices of all bookingsupplements for the travel
		var supplementPriceSum = new BigDecimal(0);
		var supplmentPriceSumRow = db.run(Select.from(BOOKING_SUPPLEMENT).columns(c -> sum(c.Price()).as("PriceSum"))
				.groupBy(c -> c.get("to_Booking.to_Travel.TravelUUID"))
				.having(c -> c.to_Travel().TravelUUID().eq(travelUUID).and(c.IsActiveEntity().eq(isActiveEntity))))
				.first();
		if (supplmentPriceSumRow.isPresent()) {
			supplementPriceSum = new BigDecimal(supplmentPriceSumRow.get().get("PriceSum").toString());
		}

		// update travel's total price
		return bookingFee.add(flightPriceSum).add(supplementPriceSum);
	}

}
