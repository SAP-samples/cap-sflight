package com.sap.cap.sflight.processor;

import cds.gen.travelservice.AcceptTravelContext;
import cds.gen.travelservice.RejectTravelContext;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.TravelStatus;
import cds.gen.travelservice.Travel_;
import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class ApprovalHandler implements EventHandler {

    private static final String REJECT_TRAVEL = "rejectTravel";
    private static final String ACCEPT_TRAVEL = "acceptTravel";
    public static final String OPEN = "O";

    private final PersistenceService db;

    public ApprovalHandler(PersistenceService db) {
        this.db = db;
    }

    @After(event = CdsService.EVENT_READ, entity = Travel_.CDS_NAME)
    public void setUiEnabledFields(final List<Travel> travels) {
        travels.forEach(travel -> {
            if(travel.getTravelStatus() != null) {
                travel.setAcceptEnabled(!travel.getTravelStatus().getCode().equalsIgnoreCase("A"));
                travel.setRejectEnabled(!travel.getTravelStatus().getCode().equalsIgnoreCase("X"));
                travel.setDeductDiscountEnabled(!travel.getTravelStatus().getCode().equalsIgnoreCase("A"));
            }
        });
    }

    @Before(event = ACCEPT_TRAVEL, entity = Travel_.CDS_NAME)
    public void beforeAcceptTravel(final AcceptTravelContext context) {

        db.run(context.getCqn()).first().ifPresent(row -> {
            var travel = row.as(Travel.class);
            checkIfTravelHasExceptedStatus(travel, "O");
        });
    }

    @Before(event = REJECT_TRAVEL, entity = Travel_.CDS_NAME)
    public void beforeRejectTravel(final RejectTravelContext context) {
        db.run(context.getCqn()).first().ifPresent(row -> {
            var travel = row.as(Travel.class);
            checkIfTravelHasExceptedStatus(travel, "O");
        });
    }

    @On(event = REJECT_TRAVEL)
    public void onRejectTravel(final RejectTravelContext context) {
        var travel = db.run(context.getCqn()).single().as(Travel.class);
        updateStatusForTravelId(travel.getTravelUUID(), "X");
    }

    @On(event = {ACCEPT_TRAVEL}, entity = Travel_.CDS_NAME)
    public void onAcceptTravel(final AcceptTravelContext context) {
        var travel = db.run(context.getCqn()).single().as(Travel.class);
        updateStatusForTravelId(travel.getTravelUUID(), "A");
    }

    private void updateStatusForTravelId(String travelUUID, String newStatus) {
        var travel = Travel.create();

        var travelStatus = TravelStatus.create();
        travelStatus.setCode(OPEN);
        travelStatus.setCode(newStatus);

        travel.setTravelUUID(travelUUID);
        travel.setTravelStatus(travelStatus);
        Update<Travel_> travelUpdate = Update.entity(Travel_.class).data(travel);
        db.run(travelUpdate);
    }

    private void checkIfTravelHasExceptedStatus(Travel travel, String status) {
        if(travel.getTravelStatusCode() != null && !travel.getTravelStatusCode().equalsIgnoreCase(status)) {
            throw new TravelAlreadyRejectedException("Travel with Id {} does not have expected status " +
                    " {} but already has status {}.", travel.getTravelID(), status, travel.getTravelStatusCode());
        }
    }
}
