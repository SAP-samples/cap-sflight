package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.BOOKING;
import static cds.gen.travelservice.TravelService_.BOOKING_SUPPLEMENT;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import static com.sap.cds.services.cds.CqnService.EVENT_CREATE;
import static com.sap.cds.services.cds.CqnService.EVENT_UPDATE;
import static com.sap.cds.services.draft.DraftService.EVENT_DRAFT_CANCEL;
import static com.sap.cds.services.draft.DraftService.EVENT_DRAFT_PATCH;
import static java.lang.Boolean.FALSE;
import static java.util.Objects.requireNonNullElse;

import java.math.BigDecimal;
import java.util.Map;
import java.util.function.UnaryOperator;

import org.springframework.stereotype.Component;

import com.sap.cds.Result;
import com.sap.cds.Struct;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnAnalyzer;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.ErrorStatuses;
import com.sap.cds.services.ServiceException;
import com.sap.cds.services.draft.DraftCancelEventContext;
import com.sap.cds.services.draft.DraftPatchEventContext;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.sap.fe.cap.travel.TravelModel_;
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

	private static final BigDecimal ZERO = new BigDecimal(0);

	private final DraftService draftService;
	private final PersistenceService persistenceService;

	public RecalculatePriceHandler(DraftService draftService, PersistenceService persistenceService) {
		this.draftService = draftService;
		this.persistenceService = persistenceService;
	}

	@After(event = { EVENT_CREATE, EVENT_UPDATE }, entity = Travel_.CDS_NAME)
	public void calculateTotalPriceOfTravel(Travel travel) {
		String travelUUID = travel.travelUUID();
		if (travelUUID != null) {
			BigDecimal totalPrice = calculateTravelPrice(travelUUID);
			persistenceService.run(Update.entity(TRAVEL).data(Travel.create()
					.travelUUID(travelUUID)
					.totalPrice(totalPrice)));

			travel.totalPrice(totalPrice);
		}
	}

	private BigDecimal calculateTravelPrice(String travelUUID) {
		BigDecimal bookingFee = run(Select.from(TravelModel_.TRAVEL)
				.columns(t -> t.BookingFee().as("sum"))
				.byId(travelUUID));

		BigDecimal flights = run(Select.from(BOOKING)
				.columns(b -> b.FlightPrice().sum().as("sum"))
				.where(b -> b.to_Travel_TravelUUID().eq(travelUUID)));

		BigDecimal supplements = run(Select.from(BOOKING_SUPPLEMENT)
				.columns(s -> s.Price().sum().as("sum"))
				.where(s -> s.to_Booking().to_Travel().TravelUUID().eq(travelUUID)));

		return bookingFee.add(flights).add(supplements);
	}

	private BigDecimal run(CqnSelect query) {
		Result result = persistenceService.run(query);
		BigDecimal sum = result.first(Price.class).map(Price::sum).orElse(ZERO);

		return nullToZero(sum);
	}

	private interface Price {
		BigDecimal sum();
	}

	@On(event = { EVENT_DRAFT_PATCH }, entity = Travel_.CDS_NAME)
	public void updateTravelPriceOnBookingFeeUpdate(DraftPatchEventContext context) {
		CqnUpdate update = context.getCqn();
		Travel travel = Struct.access(update.data()).as(Travel.class);
		BigDecimal newFee = travel.bookingFee();
		if (newFee != null) {
			var travelKeys = CqnAnalyzer.create(context.getModel()).analyze(update).targetKeys();
			BigDecimal oldFee = selectTravelFee(travelKeys);
			BigDecimal travelPrice = selectTravelPrice(travelKeys.get(Travel.TRAVEL_UUID)).add(newFee).subtract(oldFee);

			travel.totalPrice(travelPrice);
		}
	}

	@On(event = { EVENT_DRAFT_PATCH }, entity = Booking_.CDS_NAME)
	public void updateTravelPriceOnBookingUpdate(Booking bookingPatch) {
		BigDecimal newPrice = bookingPatch.flightPrice();
		if (newPrice != null) {
			Booking booking = selectBookingPrice(Booking.create()
					.bookingUUID(bookingPatch.bookingUUID())
					.isActiveEntity(false));

			String travelUUID = booking.toTravelTravelUUID();
			updateTravelPrice(travelUUID, newPrice, booking.flightPrice());
		}
	}

	@On(event = { EVENT_DRAFT_PATCH }, entity = BookingSupplement_.CDS_NAME)
	public void updateTravelPriceOnSupplementUpdate(BookingSupplement supplementPatch) {
		BigDecimal newPrice = supplementPatch.price();
		if (newPrice != null) {
			BookingSupplement supplement = selectSupplementPrice(s -> s
					.bookSupplUUID(supplementPatch.bookSupplUUID())
					.isActiveEntity(false));

			String travelUUID = supplement.toTravelTravelUUID();
			updateTravelPrice(travelUUID, newPrice, supplement.price());
		}
	}

	private void updateTravelPrice(String travelUUID, BigDecimal newPrice, BigDecimal oldPrice) {
		BigDecimal travelPrice = selectTravelPrice(travelUUID).add(newPrice).subtract(nullToZero(oldPrice));
		updateTravelPrice(travelUUID, travelPrice);
	}

	private void updateTravelPrice(String travelUUID, BigDecimal totalPrice) {
		CqnUpdate update = Update.entity(TRAVEL).byId(travelUUID).data(Travel.TOTAL_PRICE, totalPrice);
		draftService.patchDraft(update);
	}

	@On(event = { EVENT_DRAFT_CANCEL }, entity = Booking_.CDS_NAME)
	public void updateTravelPriceOnCancelBooking(DraftCancelEventContext context) {
		Booking booking = selectBookingPrice(entityKeys(context));
		String travelUUID = booking.toTravelTravelUUID();
		BigDecimal supplementPrice = calculateSupplementPrice(booking.bookingUUID());
		BigDecimal totalPrice = selectTravelPrice(travelUUID).subtract(supplementPrice)
				.subtract(nullToZero(booking.flightPrice()));

		updateTravelPrice(travelUUID, totalPrice);
	}

	private BigDecimal calculateSupplementPrice(String bookingUUID) {
		Result result = draftService.run(Select.from(BOOKING_SUPPLEMENT).columns(s -> s.Price().sum().as("sum"))
				.where(s -> s.to_Booking_BookingUUID().eq(bookingUUID).and(s.IsActiveEntity().eq(FALSE))));
		Price price = result.single(Price.class);

		return nullToZero(price.sum());
	}

	@On(event = { EVENT_DRAFT_CANCEL }, entity = BookingSupplement_.CDS_NAME)
	public void updateTravelPriceAfterDeleteBookingSupplement(DraftCancelEventContext context) {
		BookingSupplement supplement = selectSupplementPrice(entityKeys(context));

		if (supplement.price() != null) {
			String travelUUID = supplement.toTravelTravelUUID();
			updateTravelPrice(travelUUID, ZERO, supplement.price());
		}
	}

	private static Map<String, Object> entityKeys(DraftCancelEventContext context) {
		return CqnAnalyzer.create(context.getModel()).analyze(context.getCqn()).targetKeys();
	}

	private BigDecimal selectTravelPrice(Object travelUUID) {
		CqnSelect query = Select.from(TRAVEL).columns(t -> t.TotalPrice().as("sum")).matching(Map.of(
						Travel.TRAVEL_UUID, travelUUID,
						Travel.IS_ACTIVE_ENTITY, false));
		BigDecimal price = draftService.run(query).single(Price.class).sum();

		return nullToZero(price);
	}

	private BigDecimal selectTravelFee(Map<String, Object> travelKeys) {
		CqnSelect query = Select.from(TRAVEL).matching(travelKeys).columns(b -> b.BookingFee());
		Travel travel = draftService.run(query).single(Travel.class);

		return nullToZero(travel.bookingFee());
	}

	private Booking selectBookingPrice(Map<String, Object> bookingKeys) {
		CqnSelect query = Select.from(BOOKING).matching(bookingKeys).columns(
			b -> b.BookingUUID(), b -> b.to_Travel_TravelUUID(), b -> b.FlightPrice());
		return draftService.run(query).single(Booking.class);
	}

	private BookingSupplement selectSupplementPrice(UnaryOperator<BookingSupplement> supplement) {
		return selectSupplementPrice(supplement.apply(BookingSupplement.create()));
	}

	private BookingSupplement selectSupplementPrice(Map<String, Object> supplementKeys) {
		CqnSelect query = Select.from(BOOKING_SUPPLEMENT).matching(supplementKeys)
				.columns(s -> s.to_Booking().to_Travel_TravelUUID(), s -> s.Price());
		return draftService.run(query).single(BookingSupplement.class);
	}

	private static BigDecimal nullToZero(BigDecimal d) {
		return requireNonNullElse(d, ZERO);
	}

	@Before(event = { EVENT_CREATE, EVENT_UPDATE }, entity = { Booking_.CDS_NAME, BookingSupplement_.CDS_NAME })
	public void disableUpdateAndCreateForBookingAndBookingSupplement() {
		throw new ServiceException(ErrorStatuses.BAD_REQUEST, "error.booking.only_patch");
	}

}
