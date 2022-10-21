package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.BOOKING;
import static cds.gen.travelservice.TravelService_.BOOKING_SUPPLEMENT;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import static com.sap.cds.ql.CQL.sum;
import static java.lang.Boolean.FALSE;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.sap.cds.Row;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.ErrorStatuses;
import com.sap.cds.services.ServiceException;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import com.sap.cds.services.utils.StringUtils;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.BookingSupplement;
import cds.gen.travelservice.BookingSupplement_;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class RecalculatePriceHandler implements EventHandler {

	private final DraftService draftService;
	private final PersistenceService persistenceService;

	public RecalculatePriceHandler(DraftService draftService, PersistenceService persistenceService) {
		this.draftService = draftService;
		this.persistenceService = persistenceService;
	}

	@Before(event = {CqnService.EVENT_CREATE, CqnService.EVENT_UPDATE}, entity = {Booking_.CDS_NAME, BookingSupplement_.CDS_NAME})
	public void disableUpdateAndCreateForBookingAndBookingSupplement() {
		throw new ServiceException(ErrorStatuses.BAD_REQUEST, "error.booking.only_patch");
	}

	private static BigDecimal calculateTotalPriceForTravel(CqnService db, String travelUUID,
			boolean isActiveEntity) {
		// get booking fee
		BigDecimal bookingFee = BigDecimal.valueOf(0);
		Optional<Row> bookingFeeRow = db
				.run(Select.from(TRAVEL).columns(Travel_::BookingFee)
						.where(t -> t.TravelUUID().eq(travelUUID)
								.and(t.IsActiveEntity().eq(isActiveEntity))
								.and(t.BookingFee().isNotNull()))
						.limit(1))
				.first();
		if (bookingFeeRow.isPresent()) {
			bookingFee = (BigDecimal) bookingFeeRow.get().get("BookingFee");
		}

		// get sum of flight prices from all bookings
		BigDecimal flightPriceSum = new BigDecimal(0);
		Optional<Row> flightPriceRow = db
				.run(Select.from(BOOKING).columns(b -> sum(b.FlightPrice()).as("FlightPriceSum"))
						.where(b -> b.to_Travel_TravelUUID().eq(travelUUID).and(b.IsActiveEntity().eq(isActiveEntity))))
				.first();

		if (flightPriceRow.isPresent() && flightPriceRow.get().size() > 0) {
			flightPriceSum = new BigDecimal(flightPriceRow.get().get("FlightPriceSum").toString());
		}

		// get sum of the prices of all booking supplements for the travel
		BigDecimal supplementPriceSum = new BigDecimal(0);
		Optional<Row> supplementPriceSumRow = db
				.run(Select.from(BOOKING_SUPPLEMENT).columns(c -> sum(c.Price()).as("PriceSum"))
						.where(b -> b.to_Travel_TravelUUID().eq(travelUUID).and(b.IsActiveEntity().eq(isActiveEntity))))
				.first();
		if (supplementPriceSumRow.isPresent() && supplementPriceSumRow.get().size() > 0) {
			supplementPriceSum = new BigDecimal(supplementPriceSumRow.get().get("PriceSum").toString());
		}

		// update travel's total price
		return bookingFee.add(flightPriceSum).add(supplementPriceSum);
	}

	@After(event = {CdsService.EVENT_UPDATE, CdsService.EVENT_CREATE}, entity = Travel_.CDS_NAME)
	public void calculateNewTotalPriceForActiveTravel(Travel travel) {

		/*
		* Elements annotated with @Core.computed are not transferred during
		* DRAFT_SAVE. Normally, we'd re-compute the @Core.computed values after
		* DRAFT_SAVE and store them to the active version. For the TravelStatus_code
		* this is not possible as they originate as the result of a custom action
		* and thus cannot be re-computed. We have to take them from the draft version and
		* store them to the active version *before* the DRAFT_SAVE event.
		*/

		String travelUUID = travel.getTravelUUID();
		if (StringUtils.isEmpty(travelUUID)) {
			return;
		}
		travel.setTotalPrice(calculateTotalPriceForTravel(persistenceService, travelUUID, true));

		Map<String, Object> data = new HashMap<>();
		data.put(Travel.TOTAL_PRICE, travel.getTotalPrice());
		data.put(Travel.TRAVEL_UUID, travelUUID);
		persistenceService.run(Update.entity(TRAVEL).data(data));
	}

	@After(event = { DraftService.EVENT_DRAFT_PATCH }, entity = Travel_.CDS_NAME)
	public void recalculateTravelPriceIfTravelWasUpdated(final Travel travel) {
		if (travel.getTravelUUID() != null && travel.getBookingFee() != null) { // only for patched booking fee
			String travelUUID = travel.getTravelUUID();
			travel.setTotalPrice(calculateAndPatchNewTotalPriceForDraft(travelUUID));
		}
	}

	@After(event = { DraftService.EVENT_DRAFT_PATCH, DraftService.EVENT_DRAFT_NEW }, entity = Booking_.CDS_NAME)
	public void recalculateTravelPriceIfFlightPriceWasUpdated(final Booking booking) {
		draftService.run(Select.from(BOOKING).columns(bs -> bs.to_Travel().TravelUUID().as(Travel.TRAVEL_UUID))
				.where(bs -> bs.BookingUUID().eq(booking.getBookingUUID())
						.and(bs.IsActiveEntity().eq(FALSE))))
				.first()
				.ifPresent(row -> calculateAndPatchNewTotalPriceForDraft((String) row.get(Travel.TRAVEL_UUID)));
	}

	@After(event = { DraftService.EVENT_DRAFT_NEW, DraftService.EVENT_DRAFT_PATCH,
			DraftService.EVENT_DRAFT_SAVE }, entity = BookingSupplement_.CDS_NAME)
	public void recalculateTravelPriceIfPriceWasUpdated(final BookingSupplement bookingSupplement) {
		draftService.run(Select.from(BOOKING_SUPPLEMENT)
				.columns(bs -> bs.to_Booking().to_Travel().TravelUUID().as(Travel.TRAVEL_UUID))
				.where(bs -> bs.BookSupplUUID().eq(bookingSupplement.getBookSupplUUID())
						.and(bs.IsActiveEntity().eq(FALSE))))
				.first()
				.ifPresent(row -> calculateAndPatchNewTotalPriceForDraft((String) row.get(Travel.TRAVEL_UUID)));
	}

	private BigDecimal calculateAndPatchNewTotalPriceForDraft(final String travelUUID) {

		BigDecimal totalPrice = calculateTotalPriceForTravel(draftService, travelUUID, false);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put(Travel.TRAVEL_UUID, travelUUID);
		map.put(Travel.TOTAL_PRICE, totalPrice);
		CqnUpdate update = Update.entity(TRAVEL).data(map);
		draftService.patchDraft(update);
		return totalPrice;
	}

}
