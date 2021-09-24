package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.TRAVEL;

import java.util.List;
import java.util.Optional;

import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;

import org.springframework.stereotype.Component;

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

	private final DraftService draftService;


	public AcceptRejectHandler(DraftService draftService) {
		this.draftService = draftService;
	}

	@After(entity = Travel_.CDS_NAME, event = CdsService.EVENT_READ)
	public void setUiEnabledFields(final List<Travel> travels) {
		// calculate virtual elements for UI elements being enabled/disabled
		travels.forEach(travel -> {
			if (travel.getTravelStatus() != null) {
				travel.setAcceptEnabled(!travel.getTravelStatus().getCode().equalsIgnoreCase(TRAVEL_STATUS_ACCEPTED));
				travel.setRejectEnabled(!travel.getTravelStatus().getCode().equalsIgnoreCase(TRAVEL_STATUS_CANCELLED));
				travel.setDeductDiscountEnabled(!travel.getTravelStatus().getCode().equalsIgnoreCase(TRAVEL_STATUS_ACCEPTED));
			}
		});
	}

	@Before(entity = Travel_.CDS_NAME)
	public void beforeAcceptTravel(final AcceptTravelContext context) {

		draftService.run(context.getCqn()).first(Travel.class)
				.ifPresent(travel -> checkIfTravelHasExceptedStatus(travel, TRAVEL_STATUS_OPEN));
	}

	@Before(entity = Travel_.CDS_NAME)
	public void beforeRejectTravel(final RejectTravelContext context) {
		draftService.run(context.getCqn()).first(Travel.class)
				.ifPresent(travel -> checkIfTravelHasExceptedStatus(travel, TRAVEL_STATUS_OPEN));
	}

	@On(entity = Travel_.CDS_NAME)
	public void onRejectTravel(final RejectTravelContext context) {
		var travel = draftService.run(context.getCqn()).single(Travel.class);
		updateStatusForTravelId(travel.getTravelUUID(), TRAVEL_STATUS_CANCELLED, travel.getIsActiveEntity());
		context.setCompleted();
	}

	@On(entity = Travel_.CDS_NAME)
	public void onAcceptTravel(final AcceptTravelContext context) {
		var travel = draftService.run(context.getCqn()).single(Travel.class);
		updateStatusForTravelId(travel.getTravelUUID(), TRAVEL_STATUS_ACCEPTED, travel.getIsActiveEntity());
		context.setCompleted();
	}

	private Optional<Travel> updateStatusForTravelId(String travelUUID, String newStatus, boolean isActiveEntity) {

		if (isActiveEntity) {
			Update<Travel_> travelUpdate = Update.entity(TRAVEL).data(Travel.TRAVEL_STATUS_CODE, newStatus)
					.where(t -> t.TravelUUID().eq(travelUUID));
			return draftService.run(travelUpdate).first(Travel.class);
		} else {
			Update<Travel_> travelUpdateDraft = Update.entity(TRAVEL).data(Travel.TRAVEL_STATUS_CODE, newStatus)
					.where(t -> t.TravelUUID().eq(travelUUID).and(t.IsActiveEntity().eq(false)));
			return draftService.patchDraft(travelUpdateDraft).first(Travel.class);
		}
	}

	private void checkIfTravelHasExceptedStatus(Travel travel, String status) {
		if (travel.getTravelStatusCode() != null && !travel.getTravelStatusCode().equalsIgnoreCase(status)) {
			throw new IllegalTravelStatusException("error.travel.status.unexpected",
					travel.getTravelID(), status, travel.getTravelStatusCode());
		}
	}
}
