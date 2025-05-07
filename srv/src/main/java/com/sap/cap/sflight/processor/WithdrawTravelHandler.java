package com.sap.cap.sflight.processor;

import cds.gen.sap.fe.cap.travel.TravelStatus;
import cds.gen.sap.fe.cap.travel.TravelStatusCode;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.TravelWithdrawTravelContext;
import cds.gen.travelservice.Travel_;
import com.sap.cds.CdsData;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnStructuredTypeRef;
import com.sap.cds.services.ErrorStatuses;
import com.sap.cds.services.ServiceException;
import com.sap.cds.services.cds.ApplicationService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import com.sap.cds.services.utils.DraftUtils;
import java.time.LocalDate;
import org.springframework.stereotype.Component;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class WithdrawTravelHandler implements EventHandler {

    private final PersistenceService persistenceService;

    public WithdrawTravelHandler(PersistenceService persistenceService) {
        this.persistenceService = persistenceService;
    }

    @Before(entity = Travel_.CDS_NAME)
    public void check24HoursBeforeTravel(final TravelWithdrawTravelContext context, CqnStructuredTypeRef travelRef) {
        Travel travel = ((ApplicationService) context.getService()).run(
                Select.from(travelRef).columns(Travel_.BEGIN_DATE)).first(Travel.class)
            .orElseThrow(() -> new ServiceException(ErrorStatuses.BAD_REQUEST, "TRAVEL_NOT_FOUND"));

        if (travel.beginDate().isBefore(LocalDate.now().minusDays(1))) {
            context.getMessages().error("Travel can only be withdrawn up to 24 hours before travel begins.");
        }
    }

    @On(entity = Travel_.CDS_NAME)
    public void onWithdrawTravel(final TravelWithdrawTravelContext context, CqnStructuredTypeRef travelRef) {
        var isDraft = DraftUtils.isDraftTarget(travelRef,
            context.getModel().findEntity(travelRef.targetSegment().id()).get(), context.getModel());
        CdsData data = CdsData.create();
        data.putPath(Travel.TRAVEL_STATUS + "." + TravelStatus.CODE, TravelStatusCode.WITHDRAWN);
        var update = Update.entity(travelRef).data(data);
        if (isDraft) {
            ((DraftService) context.getService()).patchDraft(update).first(Travel.class);
        } else {
            persistenceService.run(update);
        }
        context.setCompleted();
    }

}
