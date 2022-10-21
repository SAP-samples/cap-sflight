package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.TRAVEL;

import org.springframework.stereotype.Component;

import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.travelservice.AcceptTravelContext;
import cds.gen.travelservice.RejectTravelContext;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class AcceptRejectHandler implements EventHandler {

	private static final String TRAVEL_STATUS_OPEN = "O";
	private static final String TRAVEL_STATUS_ACCEPTED = "A";
	private static final String TRAVEL_STATUS_CANCELLED = "X";

	private final PersistenceService persistenceService;
	private final DraftService draftService;

	public AcceptRejectHandler(DraftService draftService, PersistenceService persistenceService) {
		this.draftService = draftService;
		this.persistenceService = persistenceService;
	}

	@Before(entity = Travel_.CDS_NAME)
	public void beforeAcceptTravel(final AcceptTravelContext context) {

		draftService.run(context.getCqn()).first(Travel.class).ifPresent(this::checkIfTravelHasExceptedStatus);
	}

	@Before(entity = Travel_.CDS_NAME)
	public void beforeRejectTravel(final RejectTravelContext context) {
		draftService.run(context.getCqn()).first(Travel.class).ifPresent(this::checkIfTravelHasExceptedStatus);
	}

	@On(entity = Travel_.CDS_NAME)
	public void onRejectTravel(final RejectTravelContext context) {
		Travel travel = draftService.run(context.getCqn()).single(Travel.class);
		context.getCdsRuntime().requestContext().privilegedUser().run(ctx -> {
			updateStatusForTravelId(travel.getTravelUUID(), TRAVEL_STATUS_CANCELLED, travel.getIsActiveEntity());
		});
		context.setCompleted();
	}

	@On(entity = Travel_.CDS_NAME)
	public void onAcceptTravel(final AcceptTravelContext context) {
		Travel travel = draftService.run(context.getCqn()).single(Travel.class);
		context.getCdsRuntime().requestContext().privilegedUser().run(ctx -> {
			updateStatusForTravelId(travel.getTravelUUID(), TRAVEL_STATUS_ACCEPTED, travel.getIsActiveEntity());
		});
		context.setCompleted();
	}

	private void updateStatusForTravelId(String travelUUID, String newStatus, boolean isActiveEntity) {

		if (isActiveEntity) {
			persistenceService.run(Update.entity(TRAVEL).where(t -> t.TravelUUID().eq(travelUUID))
					.data(Travel.TRAVEL_STATUS_CODE, newStatus));
		} else {
			CqnUpdate travelUpdateDraft = Update.entity(TRAVEL)
					.where(t -> t.TravelUUID().eq(travelUUID).and(t.IsActiveEntity().eq(false)))
					.data(Travel.TRAVEL_STATUS_CODE, newStatus);
			draftService.patchDraft(travelUpdateDraft).first(Travel.class);
		}
	}

	private void checkIfTravelHasExceptedStatus(Travel travel) {
		if (travel.getTravelStatusCode() != null && !travel.getTravelStatusCode()
				.equalsIgnoreCase(AcceptRejectHandler.TRAVEL_STATUS_OPEN)) {
			throw new IllegalTravelStatusException("error.travel.status.unexpected", travel.getTravelID(),
					AcceptRejectHandler.TRAVEL_STATUS_OPEN, travel.getTravelStatusCode());
		}
	}
}
