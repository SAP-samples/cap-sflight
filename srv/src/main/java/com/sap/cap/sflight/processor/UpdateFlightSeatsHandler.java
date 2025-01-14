package com.sap.cap.sflight.processor;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Flight;
import cds.gen.travelservice.Flight_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;
import com.sap.cds.CdsDiffProcessor;
import com.sap.cds.CdsDiffProcessor.DiffVisitor;
import com.sap.cds.impl.diff.DiffProcessor;
import com.sap.cds.ql.CQL;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnAnalyzer;
import com.sap.cds.ql.cqn.CqnDelete;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.ql.cqn.Path;
import com.sap.cds.reflect.CdsAssociationType;
import com.sap.cds.reflect.CdsElement;
import com.sap.cds.reflect.CdsStructuredType;
import com.sap.cds.services.EventContext;
import com.sap.cds.services.cds.CdsDeleteEventContext;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static cds.gen.travelservice.TravelService_.FLIGHT;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class UpdateFlightSeatsHandler implements EventHandler {

    public static final String TO_BOOKING = "to_Booking";
    public static final String CONNECTION_ID = "ConnectionID";
    public static final String OCCUPIED_SEATS = "occupiedSeats";

    private final PersistenceService persistenceService;

    public UpdateFlightSeatsHandler(PersistenceService persistenceService) {
        this.persistenceService = persistenceService;
    }

    enum Status {
        ADDED,
        DELETED
    }

    @Before(event = { "CREATE", "UPDATE", "DELETE" }, entity = Travel_.CDS_NAME)
    public void updateSeatsDiffProc(EventContext context, List<Travel> travels) {

        Map<Status, List<Booking>> modifications = new EnumMap<>(Status.class);

        switch (context.getEvent()) {

            case CqnService.EVENT_CREATE:
                modifications.putIfAbsent(Status.ADDED, new ArrayList<>());
                for (Travel travel : travels) {
                    modifications.get(Status.ADDED).addAll(travel.toBooking());
                }
                break;

            case CqnService.EVENT_DELETE:
                modifications.putIfAbsent(Status.DELETED, new ArrayList<>());
                modifications.get(Status.DELETED)
                        .addAll(getOldStateTravel(getTravelUuidFromDeleteCqn(context)).toBooking());
                updateSeatsOnFlights(getFlights(modifications));
                break;

            case CqnService.EVENT_UPDATE:
                for (Travel travel : travels) {
                    handleUpdatedTravelWithDiffProcessor(context, travel, modifications);
                }
                break;

            default:
                throw new IllegalStateException("Unexpected value: " + context.getEvent());

        }

        updateSeatsOnFlights(getFlights(modifications));

    }

    private void handleUpdatedTravelWithDiffProcessor(EventContext context, Travel newState,
            Map<Status, List<Booking>> modifications) {

        CdsDiffProcessor diffProcessor = DiffProcessor.create();
        Travel oldState = getOldStateTravel(newState.travelUUID());
        diffProcessor.add(
                (path, cdsElement, cdsType) -> {

                    if (path.target().type().getQualifiedName().equals(Travel_.CDS_NAME)
                            && cdsElement.getName().equals(TO_BOOKING)) {
                        return true;
                    } else return path.target().type().getQualifiedName().equals(Flight_.CDS_NAME)
                            && cdsElement.getName().equals(CONNECTION_ID);
                },
                new BookingDiffVisitor(modifications, newState, oldState));

        diffProcessor.process(newState, oldState, context.getTarget());
    }

    private Travel getOldStateTravel(String travelUUID) {
        Select<Travel_> query = Select.from(TravelService_.TRAVEL)
                .where(t -> t.TravelUUID().eq(travelUUID).and(t.IsActiveEntity().eq(true)))
                .columns(Travel_::TravelUUID, t -> t.to_Booking()
                        .expand(Booking_::BookingUUID, b -> b.to_Flight()
                                .expand(Flight_::ConnectionID, Flight_::OccupiedSeats)));
        return this.persistenceService.run(query).single(Travel.class);
    }

    private String getTravelUuidFromDeleteCqn(EventContext context) {
        CqnAnalyzer cqnAnalyzer = CqnAnalyzer.create(context.getModel());
        CqnDelete deleteStatement = ((CdsDeleteEventContext) context).getCqn();
        return (String) cqnAnalyzer.analyze(deleteStatement).targetKeyValues().get("TravelUUID");
    }

    void updateSeatsOnFlights(Map<Status, List<Flight>> flightsStatus) {

        List<Flight> flights;
        for (Map.Entry<Status, List<Flight>> flightStatuses : flightsStatus.entrySet()) {

            Status status = flightStatuses.getKey();
            flights = flightsStatus.get(status);
            if (status == Status.ADDED) {
                for (Flight f : flights) {
                    CqnUpdate addSeats = Update.entity(FLIGHT).where(w -> w.ConnectionID().eq(f.connectionID()))
                            .set(OCCUPIED_SEATS, CQL.get(OCCUPIED_SEATS).plus(1));
                    this.persistenceService.run(addSeats);
                }
            }

            if (status == Status.DELETED) {
                for (Flight f : flights) {
                    CqnUpdate deleteSeats = Update.entity(FLIGHT).where(w -> w.ConnectionID().eq(f.connectionID()))
                            .set(OCCUPIED_SEATS, CQL.get(OCCUPIED_SEATS).minus(1));
                    this.persistenceService.run(deleteSeats);
                }
            }
        }
    }

    Map<Status, List<Flight>> getFlights(Map<Status, List<Booking>> bookings) {

        Map<Status, List<Flight>> flightsFromBookings = new EnumMap<>(Status.class);
        List<Flight> addedFlights = new ArrayList<>();
        List<Flight> deletedFlights = new ArrayList<>();

        for (Map.Entry<Status, List<Booking>> bookingsEntry : bookings.entrySet()) {

            Status status = bookingsEntry.getKey();
            if (status == Status.ADDED) {
                addedFlights = bookings.get(status)
                        .stream()
                        .map(Booking::toFlight).toList();

            }

            if (status == Status.DELETED) {
                deletedFlights = bookings.get(status)
                        .stream()
                        .map(Booking::toFlight).toList();
            }

        }

        if (!addedFlights.isEmpty()) {
            flightsFromBookings.put(Status.ADDED, addedFlights);
        }
        if (!deletedFlights.isEmpty()) {
            flightsFromBookings.put(Status.DELETED, deletedFlights);
        }

        return flightsFromBookings;
    }

    private static class BookingDiffVisitor implements DiffVisitor {
        private final Map<Status, List<Booking>> modifications;
        private final Travel newState;
        private final Travel oldState;

        public BookingDiffVisitor(Map<Status, List<Booking>> modifications, Travel newState, Travel oldState) {
            this.modifications = modifications;
            this.newState = newState;
            this.oldState = oldState;
        }

        @Override
        public void changed(Path newPath, Path oldPath, CdsElement element, Object newValue, Object oldValue) {

            if (newPath.target().type().getQualifiedName().equals(Flight_.CDS_NAME)
                    && element.getName().equals(CONNECTION_ID)) {

                modifications.putIfAbsent(Status.ADDED, new ArrayList<>());
                modifications.putIfAbsent(Status.DELETED, new ArrayList<>());

                List<Booking> newBooking = newState.toBooking();
                List<Booking> oldBooking = oldState.toBooking();
                modifications.get(Status.ADDED).addAll(newBooking);
                modifications.get(Status.DELETED).addAll(oldBooking);

            }
        }

        @Override
        public void added(Path newPath, Path oldPath, CdsElement association, Map<String, Object> newValue) {
            CdsStructuredType target = association != null ? association.getType().as(CdsAssociationType.class).getTarget() : newPath.target().type();

            if (target.getQualifiedName().equals(Booking_.CDS_NAME)
                    || Objects.requireNonNull(association).getName().equals(TO_BOOKING)) {
                modifications.putIfAbsent(Status.ADDED, new ArrayList<>());
                Booking addedBooking = Booking.create();
                addedBooking.putAll(newValue);
                modifications.get(Status.ADDED).add(addedBooking);
            }
        }

        @Override
        public void removed(Path newPath, Path oldPath, CdsElement association, Map<String, Object> oldValue) {
            CdsStructuredType target = association != null ? association.getType().as(CdsAssociationType.class).getTarget() : newPath.target().type();
            if (target.getQualifiedName().equals(Booking_.CDS_NAME)
                    || Objects.requireNonNull(association).getName().equals(TO_BOOKING)) {
                modifications.putIfAbsent(Status.DELETED, new ArrayList<>());
                Booking addedBooking = Booking.create();
                addedBooking.putAll(oldValue);
                modifications.get(Status.DELETED).add(addedBooking);
            }
        }
    }
}
