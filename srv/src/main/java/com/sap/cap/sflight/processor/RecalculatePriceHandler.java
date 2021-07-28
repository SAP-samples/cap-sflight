package com.sap.cap.sflight.processor;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.BookingSupplement;
import cds.gen.travelservice.BookingSupplement_;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import static cds.gen.travelservice.TravelService_.BOOKING;
import static cds.gen.travelservice.TravelService_.BOOKING_SUPPLEMENT;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import cds.gen.travelservice.Travel_;
import static com.sap.cds.ql.CQL.sum;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;
import static java.lang.Boolean.FALSE;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class RecalculatePriceHandler implements EventHandler {

	private static final String TRAVEL_UUID = "travelUUID";
	private final DraftService db;

	public RecalculatePriceHandler(DraftService db) {
		this.db = db;
	}

	@Before(event = DraftService.EVENT_DRAFT_PATCH, entity = Travel_.CDS_NAME)
	public void recalculatePriceOnBookingFeeChange(final Travel travel) {
		if (travel.getTotalPrice() == null) {
			recalculateAndApplyPriceOnBookingChange(travel.getTravelUUID());
		}
	}

	@Before(event = CdsService.EVENT_UPDATE, entity = Travel_.CDS_NAME)
	public void recalculatePriceAfterUpdate(final Travel travel) {
		if (travel.getToBooking() != null && travel.getBookingFee() != null) {
			travel.setTotalPrice(calculateTotalPriceFromTravelObject(travel));
		}
	}

	@Before(event = { DraftService.EVENT_DRAFT_PATCH, DraftService.EVENT_DRAFT_NEW }, entity = Booking_.CDS_NAME)
	public void recalculateTravelPriceIfFlightPriceWasUpdated(final Booking booking) {
		db.run(Select.from(BOOKING).columns(bs -> bs.get("to_Travel.TravelUUID").as(TRAVEL_UUID))
				.where(bs -> bs.BookingUUID().eq(booking.getBookingUUID()).and(bs.IsActiveEntity().eq(FALSE)))).first()
				.ifPresent(row -> recalculateAndApplyPriceOnBookingChange((String) row.get(TRAVEL_UUID)));
	}

	@Before(event = { DraftService.EVENT_DRAFT_NEW, DraftService.EVENT_DRAFT_PATCH,
			DraftService.EVENT_DRAFT_SAVE }, entity = BookingSupplement_.CDS_NAME)
	public void recalculateTravelPriceIfPriceWasUpdated(final BookingSupplement bookingSupplement) {
		db.run(Select.from(BOOKING_SUPPLEMENT).columns(bs -> bs.get("to_Booking.to_Travel.TravelUUID").as(TRAVEL_UUID))
				.where(bs -> bs.BookSupplUUID().eq(bookingSupplement.getBookSupplUUID())
						.and(bs.IsActiveEntity().eq(FALSE)))).first()
				.ifPresent(row -> recalculateAndApplyPriceOnBookingChange((String) row.get(TRAVEL_UUID)));
	}

	private void recalculateAndApplyPriceOnBookingChange(final String travelUUID) {

		BigDecimal totalPrice = calculateTotalPriceForTravel(travelUUID);
		var update = Update.entity(TRAVEL).data(Map.of("TravelUUID", travelUUID, "TotalPrice", totalPrice));
		db.run(update);
	}

	private BigDecimal calculateTotalPriceFromTravelObject(final Travel travel) {
		BigDecimal flightPriceSum = travel.getToBooking().stream().map(Booking::getFlightPrice).filter(Objects::nonNull)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		BigDecimal supplementPriceSum = BigDecimal.ZERO;
		for (Booking booking : travel.getToBooking()) {
			supplementPriceSum = supplementPriceSum
					.add(booking.getToBookSupplement().stream().map(BookingSupplement::getPrice)
							.filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add));
		}

		return Optional.ofNullable(travel.getBookingFee()).orElse(BigDecimal.ZERO).add(flightPriceSum)
				.add(supplementPriceSum);
	}

	private BigDecimal calculateTotalPriceForTravel(String travelUUID) {
		// get booking fee
		var bookingFee = BigDecimal.valueOf(0);
		var bookingFeeRow = db.run(Select.from(TRAVEL).columns(Travel_::BookingFee)
				.where(t -> t.TravelUUID().eq(travelUUID).and(t.IsActiveEntity().eq(false))
						.and(t.BookingFee().isNotNull())).limit(1)).first();
		if (bookingFeeRow.isPresent()) {
			bookingFee = (BigDecimal) bookingFeeRow.get().get("BookingFee");
		}

		// get sum of flightprices from all bookings
		var flightPriceSum = new BigDecimal(0);
		var flighPriceRow = db.run(Select.from(BOOKING).columns(c -> sum(c.FlightPrice()).as("FlightPriceSum"))
				.groupBy(c -> c.get("to_Travel.TravelUUID"))
				.having(c -> c.to_Travel().TravelUUID().eq(travelUUID).and(c.IsActiveEntity().eq(false)))).first();

		if (flighPriceRow.isPresent() && flighPriceRow.get().size() > 0) {
			flightPriceSum = new BigDecimal(flighPriceRow.get().get("FlightPriceSum").toString());
		}

		// get sum of the prices of all bookingsupplements for the travel
		var supplementPriceSum = new BigDecimal(0);
		var supplmentPriceSumRow = db.run(Select.from(BOOKING_SUPPLEMENT).columns(c -> sum(c.Price()).as("PriceSum"))
				.groupBy(c -> c.get("to_Booking.to_Travel.TravelUUID"))
				.having(c -> c.to_Travel().TravelUUID().eq(travelUUID).and(c.IsActiveEntity().eq(false)))).first();
		if (supplmentPriceSumRow.isPresent() && supplmentPriceSumRow.get().size() > 0) {
			supplementPriceSum = new BigDecimal(supplmentPriceSumRow.get().get("PriceSum").toString());
		}

		// update travel's total price
		return bookingFee.add(flightPriceSum).add(supplementPriceSum);
	}

}
