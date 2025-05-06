package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.TRAVEL;

import cds.gen.analyticsservice.AnalyticsService;
import cds.gen.analyticsservice.AnalyticsService.Draft;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.TravelWithdrawTravelContext;
import cds.gen.travelservice.Travel_;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnStructuredTypeRef;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.ErrorStatuses;
import com.sap.cds.services.ServiceException;
import com.sap.cds.services.cds.ApplicationService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import java.time.LocalDate;
import org.springframework.stereotype.Component;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class WithdrawTravelHandler implements EventHandler {

    private static final String TRAVEL_STATUS_WITHDRAWN = "W";

    private final PersistenceService persistenceService;

    public WithdrawTravelHandler(PersistenceService persistenceService) {
        this.persistenceService = persistenceService;
    }

    @Before(entity = Travel_.CDS_NAME)
    public void check24HoursBeforeTravel(final TravelWithdrawTravelContext context) {
        // TODO
//        if (travel.beginDate().isBefore(LocalDate.now().minusDays(1))) {
//            context.getMessages().error("Travel can only be withdrawn up to 24 hours before travel begins.");
//            return;
//        }
    }

    @On(entity = Travel_.CDS_NAME)
    public void onWithdrawTravel(final TravelWithdrawTravelContext context, CqnStructuredTypeRef travelRef) {
        // TODO: ask whether context.cqn() or Select.from(ref) is preferred
        // TODO specify columns
        Travel travel = ((ApplicationService) context.getService()).run(Select.from(travelRef).columns(Travel_.BEGIN_DATE)).first(Travel.class)
            .orElseThrow( () -> new ServiceException(ErrorStatuses.BAD_REQUEST, "TRAVEL_NOT_FOUND"));

        // todo: moved
        if (travel.beginDate().isBefore(LocalDate.now().minusDays(1))) {
            context.getMessages().error("Travel can only be withdrawn up to 24 hours before travel begins.");
            return;
        }

        // TODO: ask why travel.ref().asRef() fails a test but this doesn't -> noone knows
        updateStatusForTravelId(context, travelRef, travel.isActiveEntity());
        context.setCompleted();
    }

    private void updateStatusForTravelId(TravelWithdrawTravelContext context, CqnStructuredTypeRef travelRef, boolean isActiveEntity) {
        if (isActiveEntity) {
            persistenceService.run(Update.entity(travelRef)
                .data(Travel.TRAVEL_STATUS_CODE, TRAVEL_STATUS_WITHDRAWN));
        } else {
            CqnUpdate travelUpdateDraft = Update.entity(travelRef)
                .data(Travel.TRAVEL_STATUS_CODE, TRAVEL_STATUS_WITHDRAWN);
            ((DraftService) context.getService()).patchDraft(travelUpdateDraft).first(Travel.class);
        }
    }
}
