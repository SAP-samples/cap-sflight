package com.sap.cap.sflight.processor;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Flight;
import cds.gen.travelservice.Flight_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;
import com.google.common.annotations.VisibleForTesting;
import com.sap.cds.CdsDataProcessor;
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
import com.sap.cds.reflect.CdsType;
import com.sap.cds.services.EventContext;
import com.sap.cds.services.cds.CdsDeleteEventContext;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static cds.gen.travelservice.TravelService_.FLIGHT;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class UpdateFlightSeatsHandler /*implements EventHandler */{

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

        EnumMap<Status, List<Booking>> modifications = new EnumMap<>(Status.class);

        switch (context.getEvent()) {

            case "CREATE":
                modifications.putIfAbsent(Status.ADDED, new ArrayList<>());
                for (Travel travel : travels) {
                    modifications.get(Status.ADDED).addAll(travel.toBooking());
                }
                break;

            case "DELETE":
                modifications.putIfAbsent(Status.DELETED, new ArrayList<>());
                modifications.get(Status.DELETED)
                        .addAll(getOldStateTravel(getTravelUuidFromDeleteCqn(context)).toBooking());
                updateSeatsOnFlights(getFlights(modifications));
                break;

            case "UPDATE":
                for (Travel travel : travels) {
                    handleUpdatedTravelWithDiffProcessor(context, travel, modifications);
                }
                break;

        }

        updateSeatsOnFlights(getFlights(modifications));

    }

    private void handleUpdatedTravelWithDiffProcessor(EventContext context, Travel newState,
            EnumMap<Status, List<Booking>> modifications) {

        CdsDiffProcessor diffProcessor = DiffProcessor.create().forDeepTraversal();
        Travel oldState = getOldStateTravel(newState.travelUUID());
        diffProcessor.add(
                new CdsDataProcessor.Filter() {

                    @Override
                    public boolean test(Path path, CdsElement cdsElement, CdsType cdsType) {

                        if (path.target().type().getQualifiedName().equals(Booking_.CDS_NAME)
                                && cdsElement.getName().equals("to_Booking")) {
                            return true;
                        } else if (path.target().type().getQualifiedName().equals(Flight_.CDS_NAME)
                                && cdsElement.getName().equals("ConnectionID")) {
                            return true;
                        }
                        return false;
                    }
                },
                new DiffVisitor() {
                    @Override
                    public void changed(Path newPath, Path oldPath, CdsElement element, Object newValue, Object oldValue) {

                        if (newPath.target().type().getQualifiedName().equals(Flight_.CDS_NAME)
                                && element.getName().equals("ConnectionID")) {

                            modifications.putIfAbsent(Status.ADDED, new ArrayList<Booking>());
                            modifications.putIfAbsent(Status.DELETED, new ArrayList<Booking>());

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
                                || association.getName().equals("to_Booking")) {
                            modifications.putIfAbsent(Status.ADDED, new ArrayList<Booking>());
                            Booking addedBooking = Booking.create();
                            addedBooking.putAll(newValue);
                            modifications.get(Status.ADDED).add(addedBooking);
                        }
                    }

                    @Override
                    public void removed(Path newPath, Path oldPath, CdsElement association, Map<String, Object> oldValue) {
                        CdsStructuredType target = association != null ? association.getType().as(CdsAssociationType.class).getTarget() : newPath.target().type();
                        if (target.getQualifiedName().equals(Booking_.CDS_NAME)
                                || association.getName().equals("to_Booking")) {
                            modifications.putIfAbsent(Status.DELETED, new ArrayList<Booking>());
                            Booking addedBooking = Booking.create();
                            addedBooking.putAll(oldValue);
                            modifications.get(Status.DELETED).add(addedBooking);
                        }
                    }
                });

        diffProcessor.process(newState, oldState, context.getTarget());
    }

    @VisibleForTesting
    private Travel getOldStateTravel(String travelUUID) {
        Select query = Select.from(TravelService_.TRAVEL)
                .where(t -> t.TravelUUID().eq(travelUUID).and(t.IsActiveEntity().eq(true)))
                .columns(t -> t.TravelUUID(), t -> t.to_Booking()
                        .expand(b -> b.BookingUUID(), b -> b.to_Flight()
                                .expand(f -> f.ConnectionID(), f -> f.OccupiedSeats())));
        return this.persistenceService.run(query).single(Travel.class);
    }

    @VisibleForTesting
    private String getTravelUuidFromDeleteCqn(EventContext context) {
        CqnAnalyzer cqnAnalyzer = CqnAnalyzer.create(context.getModel());
        CqnDelete deleteStatement = ((CdsDeleteEventContext) context).getCqn();
        return (String) cqnAnalyzer.analyze(deleteStatement).targetKeyValues().get("TravelUUID");
    }

    @VisibleForTesting
    void updateSeatsOnFlights(EnumMap<Status, List<Flight>> flightsStatus) {

        List<Flight> flights = new ArrayList<>();

        for (Status status : flightsStatus.keySet()) {

            flights = flightsStatus.get(status);

            if (status == Status.ADDED) {

                for (Flight f : flights) {

                    CqnUpdate addSeats = Update.entity(FLIGHT).where(w -> w.ConnectionID().eq(f.connectionID()))
                            .set("occupiedSeats", CQL.get("occupiedSeats").plus(1));
                    this.persistenceService.run(addSeats);
                }
            }

            if (status == Status.DELETED) {

                for (Flight f : flights) {

                    CqnUpdate deleteSeats = Update.entity(FLIGHT).where(w -> w.ConnectionID().eq(f.connectionID()))
                            .set("occupiedSeats", CQL.get("occupiedSeats").minus(1));
                    this.persistenceService.run(deleteSeats);
                }
            }
        }

    }

    @VisibleForTesting
    EnumMap<Status, List<Flight>> getFlights(EnumMap<Status, List<Booking>> bookings) {

        EnumMap<Status, List<Flight>> flightsFromBookings = new EnumMap<>(Status.class);
        // Set<Status> keys = bookings.keySet();
        List<Flight> addedFlights = new ArrayList<>();
        List<Flight> deletedFlights = new ArrayList<>();

        for (Status status : bookings.keySet()) {

            if (status == Status.ADDED) {
                addedFlights = bookings.get(status)
                        .stream()
                        .map(b -> b.toFlight())
                        .collect(Collectors.toList());

            }

            if (status == Status.DELETED) {
                deletedFlights = bookings.get(status)
                        .stream()
                        .map(b -> b.toFlight())
                        .collect(Collectors.toList());

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
}
