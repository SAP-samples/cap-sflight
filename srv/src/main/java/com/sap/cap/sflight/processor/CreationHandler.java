package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.TRAVEL;

import java.time.LocalDate;
import java.util.EventListener;
import java.util.Map;
import java.util.Objects;

import com.sap.cds.Result;
import com.sap.cds.ql.Select;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;

import org.springframework.stereotype.Component;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.BookingSupplement;
import cds.gen.travelservice.BookingSupplement_;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.TravelStatus;
import cds.gen.travelservice.Travel_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class CreationHandler implements EventListener {
    private static final String MAX_ID = "maxId";

    private final DraftService db;

    public CreationHandler(DraftService db) {
        this.db = db;
    }

    @Before(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE }, entity = Travel_.CDS_NAME)
    public void setBookingDateIfNotProvided(final Travel travel) {
        if (travel.getToBooking() != null) {
            for (Booking booking : travel.getToBooking()) {
                if (booking.getBookingDate() == null) {
                    booking.setBookingDate(LocalDate.now());
                }
            }
        }
    }

    @Before(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE }, entity = Travel_.CDS_NAME)
    public void checkTravelEndDateIsAfterBeginDate(Travel travel) {

        travel = db
                .run(Select.from(TRAVEL).matching(Map.of("TravelUUID", travel.getTravelUUID(), "IsActiveEntity", true)))
                .single().as(Travel.class);

        if (travel.getBeginDate() == null || travel.getEndDate() == null) {
            throw new IllegalTravelDateException(
                    "Travel with travelId {} has illegal "
                            + "travel dates. Both must not be null. Begin date {}, end date {}.",
                    travel.getTravelID(), travel.getBeginDate(), travel.getEndDate());
        }

        if (travel.getBeginDate().isAfter(travel.getEndDate())) {
            throw new IllegalTravelDateException(
                    "Travel with travelID {} has illegal " + "travel dates. End date {} is before begin date {}.",
                    travel.getTravelID(), travel.getBeginDate(), travel.getEndDate());
        }

        if (travel.getBeginDate().isBefore(LocalDate.now().atStartOfDay().toLocalDate())) {
            throw new IllegalTravelDateException(
                    "Travel with travelID {} has illegal travel " + "dates: Begin date {} must not be in the past.",
                    travel.getTravelID(), travel.getBeginDate());
        }
    }

    @Before(event = CdsService.EVENT_CREATE, entity = Travel_.CDS_NAME)
    public void autoIncrementTravelIdBeforeCreation(final Travel travel) {
        Select<Travel_> maxIdSelect = Select.from(TRAVEL).columns(e -> e.TravelID().max().as(MAX_ID));

        Result maxIdResult = db.run(maxIdSelect);
        int maxId = Integer.parseInt((String) maxIdResult.single().get(MAX_ID));
        travel.setTravelID(maxId + 1);
    }

    @Before(event = { CdsService.EVENT_CREATE, CdsService.EVENT_UPDATE }, entity = Travel_.CDS_NAME)
    public void autoIncrementBookingIdAndBookingSupplementIdBeforeCreationAndUpdate(final Travel travel) {
        if (travel.getToBooking() != null) {
            int maxBookingId = travel.getToBooking().stream().map(Booking::getBookingID).filter(Objects::nonNull)
                    .max(Integer::compareTo).orElse(0);

            for (Booking booking : travel.getToBooking()) {
                if (booking.getBookingID() == null || booking.getBookingID() == 0) {
                    booking.setBookingID(++maxBookingId);
                }

                int maxSupplementId = booking.getToBookSupplement().stream()
                        .map(BookingSupplement::getBookingSupplementID).filter(Objects::nonNull).max(Integer::compareTo)
                        .orElse(0);

                for (BookingSupplement supplement : booking.getToBookSupplement()) {
                    if (supplement.getBookingSupplementID() == null || supplement.getBookingSupplementID() == 0) {
                        supplement.setBookingSupplementID(++maxSupplementId);
                    }
                }
            }
        }
    }

    @Before(event = CdsService.EVENT_CREATE, entity = Travel_.CDS_NAME)
    public void initialTravelStatus(final Travel travel) {
        TravelStatus travelStatus = TravelStatus.create();
        travelStatus.setCode("O");
        travel.setTravelStatus(travelStatus);
    }

    @Before(event = DraftService.EVENT_DRAFT_NEW, entity = Travel_.CDS_NAME)
    public void initialTravelId(final Travel travel) {
        travel.setTravelID(0);
    }

    @Before(event = DraftService.EVENT_DRAFT_NEW, entity = Booking_.CDS_NAME)
    public void initialBookingId(final Booking booking) {
        if (booking.getBookingID() == null) {
            booking.setBookingID(0);
        }
    }

    @Before(event = DraftService.EVENT_DRAFT_NEW, entity = BookingSupplement_.CDS_NAME)
    public void initialBookingSupplementId(final BookingSupplement bookingSupplement) {
        if (bookingSupplement.getBookingSupplementID() == null) {
            bookingSupplement.setBookingSupplementID(0);
        }
    }

}
