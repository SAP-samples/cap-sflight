package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.TRAVEL;

import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.TravelWithdrawTravelContext;
import cds.gen.travelservice.Travel_;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
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
    private final DraftService draftService;

    public WithdrawTravelHandler(DraftService draftService, PersistenceService persistenceService) {
        this.persistenceService = persistenceService;
        this.draftService = draftService;
    }

    @On(entity = Travel_.CDS_NAME)
    public void onWithdrawTravel(final TravelWithdrawTravelContext context) {
        Travel travel = draftService.run(context.cqn()).single(Travel.class);
        if (travel != null && travel.beginDate().isBefore(LocalDate.now().minusDays(1))) {
            context.getMessages().error("Travel can only be withdrawn up to 24 hours before travel begins.");
            return;
        }

        updateStatusForTravelId(travel.travelUUID(), travel.isActiveEntity());
        context.setCompleted();
    }

    private void updateStatusForTravelId(String travelUUID, boolean isActiveEntity) {
        if (isActiveEntity) {
            persistenceService.run(Update.entity(TRAVEL).where(t -> t.TravelUUID().eq(travelUUID))
                .data(Travel.TRAVEL_STATUS_CODE, TRAVEL_STATUS_WITHDRAWN));
        } else {
            CqnUpdate travelUpdateDraft = Update.entity(TRAVEL)
                .where(t -> t.TravelUUID().eq(travelUUID).and(t.IsActiveEntity().eq(false)))
                .data(Travel.TRAVEL_STATUS_CODE, TRAVEL_STATUS_WITHDRAWN);
            draftService.patchDraft(travelUpdateDraft).first(Travel.class);
        }
    }
}
