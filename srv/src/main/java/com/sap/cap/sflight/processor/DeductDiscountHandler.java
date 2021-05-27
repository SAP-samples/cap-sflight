package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.TRAVEL;

import java.math.BigDecimal;
import java.util.Map;

import com.sap.cds.ql.Update;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;

import org.springframework.stereotype.Component;

import cds.gen.travelservice.DeductDiscountContext;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class DeductDiscountHandler implements EventHandler {

    private final DraftService db;

    public DeductDiscountHandler(DraftService db) {
        this.db = db;
    }

    @On(event = "deductDiscount", entity = Travel_.CDS_NAME)
    public void deductDiscount(final DeductDiscountContext context) {

        Travel travel = db.run(context.getCqn()).single(Travel.class);
        BigDecimal discount = BigDecimal.valueOf(context.getPercent()).divide(BigDecimal.valueOf(100));

        BigDecimal deductedTotalPrice = travel.getTotalPrice().subtract(travel.getBookingFee().multiply(discount));
        BigDecimal deductedBookingFee = travel.getBookingFee().subtract(travel.getBookingFee().multiply(discount));

        travel.setTotalPrice(deductedTotalPrice);
        travel.setBookingFee(deductedBookingFee);

        var updateCqn = Update.entity(TRAVEL)
                .data(Map.of("BookingFee", deductedBookingFee, "TotalPrice", deductedTotalPrice, "TravelUUID",
                        travel.getTravelUUID(), "IsActiveEntity", travel.getIsActiveEntity()));

        if (travel.getIsActiveEntity()) {
            db.run(updateCqn);
        } else {
            db.patchDraft(updateCqn);
        }

        context.setResult(travel);
    }
}
