package com.sap.cap.sflight.processor;

import cds.gen.travelservice.AcceptTravelContext;
import cds.gen.travelservice.RejectTravelContext;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import cds.gen.travelservice.Travel_;
import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.ApplicationService;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class ApprovalHandler implements EventHandler {

	public static final String OPEN = "O";
	private static final String REJECT_TRAVEL = "rejectTravel";
	private static final String ACCEPT_TRAVEL = "acceptTravel";

	private final PersistenceService persistenceService;
	private final ApplicationService applicationService;
	private final DraftService draftService;

	public ApprovalHandler(PersistenceService persistenceService, ApplicationService applicationService,
			DraftService draftService) {
		this.persistenceService = persistenceService;
		this.applicationService = applicationService;
		this.draftService = draftService;
	}

	@After(event = CdsService.EVENT_READ, entity = Travel_.CDS_NAME)
	public void setUiEnabledFields(final List<Travel> travels) {
		travels.forEach(travel -> {
			if (travel.getTravelStatus() != null) {
				travel.setAcceptEnabled(!travel.getTravelStatus().getCode().equalsIgnoreCase("A"));
				travel.setRejectEnabled(!travel.getTravelStatus().getCode().equalsIgnoreCase("X"));
				travel.setDeductDiscountEnabled(!travel.getTravelStatus().getCode().equalsIgnoreCase("A"));
			}
		});
	}

	@Before(event = ACCEPT_TRAVEL, entity = Travel_.CDS_NAME)
	public void beforeAcceptTravel(final AcceptTravelContext context) {

		applicationService.run(context.getCqn()).first().ifPresent(row -> {
			var travel = row.as(Travel.class);
			checkIfTravelHasExceptedStatus(travel, "O");
		});
	}

	@Before(event = REJECT_TRAVEL, entity = Travel_.CDS_NAME)
	public void beforeRejectTravel(final RejectTravelContext context) {
		applicationService.run(context.getCqn()).first().ifPresent(row -> {
			var travel = row.as(Travel.class);
			checkIfTravelHasExceptedStatus(travel, "O");
		});
	}

	@On(event = REJECT_TRAVEL)
	public void onRejectTravel(final RejectTravelContext context) {
		var travel = applicationService.run(context.getCqn()).single().as(Travel.class);
		updateStatusForTravelId(travel.getTravelUUID(), "X", travel.getIsActiveEntity());
		context.setCompleted();
	}

	@On(event = { ACCEPT_TRAVEL }, entity = Travel_.CDS_NAME)
	public void onAcceptTravel(final AcceptTravelContext context) {
		var travel = applicationService.run(context.getCqn()).single().as(Travel.class);
		updateStatusForTravelId(travel.getTravelUUID(), "A", travel.getIsActiveEntity());
		context.setCompleted();
	}

	private Optional<Travel> updateStatusForTravelId(String travelUUID, String newStatus, boolean isActiveEntity) {

		if(isActiveEntity) {
			Update<Travel_> travelUpdate = Update.entity(TRAVEL).data("TravelStatus_code", newStatus)
					.where(t -> t.TravelUUID().eq(travelUUID));
			return persistenceService.run(travelUpdate).first(Travel.class);
		} else {
			Update<Travel_> travelUpdateDraft = Update.entity(TRAVEL).data("TravelStatus_code", newStatus)
					.where(t -> t.TravelUUID().eq(travelUUID).and(t.IsActiveEntity().eq(false)));
			return draftService.patchDraft(travelUpdateDraft).first(Travel.class);
		}
	}

	private void checkIfTravelHasExceptedStatus(Travel travel, String status) {
		if (travel.getTravelStatusCode() != null && !travel.getTravelStatusCode().equalsIgnoreCase(status)) {
			throw new TravelAlreadyRejectedException(
					"Travel with Id {} does not have expected status " + " {} but already has status {}.",
					travel.getTravelID(), status, travel.getTravelStatusCode());
		}
	}
}
