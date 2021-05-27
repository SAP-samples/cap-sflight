package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.BOOKING;
import static cds.gen.travelservice.TravelService_.BOOKING_SUPPLEMENT;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import static com.sap.cds.ql.CQL.sum;

import java.math.BigDecimal;
import java.util.Map;

import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.ServiceName;

import org.springframework.stereotype.Component;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.BookingSupplement;
import cds.gen.travelservice.BookingSupplement_;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class RecalculatePriceHandler {

    private final DraftService db;

    public RecalculatePriceHandler(DraftService db) {
        this.db = db;
    }

    @After(event = DraftService.EVENT_DRAFT_PATCH, entity = Travel_.CDS_NAME)
    public void recalculatePriceOnBookingFeeChange(final Travel travel) {
        if (travel.getBookingFee() != null) {
            recalculatePriceOnBookingChange(travel.getTravelUUID());
        }
    }

    @After(event = DraftService.EVENT_DRAFT_PATCH, entity = Booking_.CDS_NAME)
    public void recalculateTravelPriceIfFlightPriceWasUpdated(final Booking booking) {
        if (booking.getFlightPrice() != null) {
            recalculatePriceOnBookingChange(booking.getToTravelTravelUUID());
        }
    }

    @After(event = DraftService.EVENT_DRAFT_PATCH, entity = BookingSupplement_.CDS_NAME)
    public void recalculateTravelPriceIfPriceWasUpdated(final BookingSupplement bookingSupplement) {
        if (bookingSupplement.getPrice() != null) {
            recalculatePriceOnBookingChange(bookingSupplement.getToTravelTravelUUID());
        }
    }

    private void recalculatePriceOnBookingChange(final String travelUUID) {
        var bookingFee = (BigDecimal) db.run(Select.from(TRAVEL).columns(Travel_::BookingFee).byId(travelUUID)).single()
                .get("BookingFee");

        var flightPriceSum = (BigDecimal) db
                .run(Select.from(BOOKING).columns(c -> sum(c.FlightPrice()).as("FlightPriceSum"))
                        .groupBy(c -> c.FlightPrice()).having(c -> c.to_Travel().TravelUUID().eq(travelUUID)))
                .single().get("FlightPriceSum");

        var supplementPriceSum = (BigDecimal) db
                .run(Select.from(BOOKING_SUPPLEMENT).columns(c -> sum(c.Price()).as("PriceSum")).groupBy(c -> c.Price())
                        .having(c -> c.to_Travel().TravelUUID().eq(travelUUID)));

        var totalPrice = bookingFee.add(flightPriceSum).add(supplementPriceSum);

        Update.entity(TRAVEL).byId(travelUUID).data(Map.of("TotalPrice", totalPrice));
    }

}
