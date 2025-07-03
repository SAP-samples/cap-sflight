package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.FLIGHT;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import static org.junit.jupiter.api.Assertions.assertEquals;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Flight;
import cds.gen.travelservice.Flight_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService;
import cds.gen.travelservice.Travel_;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.persistence.PersistenceService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
class UpdateFlightSeatsHandlerServiceIntegrationTest {

    @Autowired
    private TravelService travelService;

    @Autowired
    private PersistenceService dbService;

    @Autowired
    private Environment environment;

    @Test
    @WithMockUser("amy")
    void testUpdateFlightHandlerForAddedBooking() {
        if (environment.acceptsProfiles(Profiles.of("cloud"))) {
            return; // skip in cloud
        }

        // Retrieve some flight to add it to the new booking
        Flight flightBeforeAdded = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq("0001"))).first(Flight.class).orElseThrow();
        Integer numberOcSeatsBeforeAdded = flightBeforeAdded.occupiedSeats();
        Integer expectedNrOcSeats = numberOcSeatsBeforeAdded + 1;

        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq("72757221A8E4645C17002DF03754AB66"))
                .columns(Travel_::TravelUUID, t -> t.to_Booking()
                        .expand(Booking_::BookingUUID, b -> b.to_Flight()
                                .expand(Flight_::ConnectionID, Flight_::OccupiedSeats)));

        Travel travel = travelService.run(querySelect).single(Travel.class);

        // Compose an updated version of the entity which was retrieved before
        Booking addedBooking = Booking.create();
        addedBooking.bookingUUID("c0adcdc4-47c0-48d9-9787-46a15927c357");
        Flight flight = Flight.create();
        flight.connectionID("0001");
        addedBooking.toFlight(flight);
        travel.toBooking().add(addedBooking);
        addRequiredDataToTravel(travel);

        CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travel);
        travelService.run(queryUpdate);

        Flight flightAfterUpdate = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq("0001"))).first(Flight.class).orElseThrow();
        Integer actualNumberOfOccupiedSeats = flightAfterUpdate.occupiedSeats();

        assertEquals(expectedNrOcSeats, actualNumberOfOccupiedSeats);
    }

    @Test
    @WithMockUser("amy")
    void testUpdateFlightHandlerForDeletedBooking() {
        if (environment.acceptsProfiles(Profiles.of("cloud"))) {
            return; // skip in cloud
        }

        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq("72757221A8E4645C17002DF03754AB66"))
                .columns(Travel_::TravelUUID, t -> t.to_Booking()
                        .expand(Booking_::BookingUUID, b -> b.to_Flight()
                                .expand(Flight_::ConnectionID, Flight_::OccupiedSeats)));

        Travel travel = travelService.run(querySelect).single(Travel.class);

        // Compose an updated version of the entity which was retrieved before
        Flight flightToBeDeleted = travel.toBooking().getFirst().toFlight();
        String flightID = flightToBeDeleted.connectionID();
        Integer numberOcSeatsBeforeAdded = flightToBeDeleted.occupiedSeats();
        Integer expectedNrOcSeats = numberOcSeatsBeforeAdded - 1;
        travel.toBooking().removeFirst();

        addRequiredDataToTravel(travel);

        CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travel);
        travelService.run(queryUpdate);

        Flight flightAfterUpdate = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(flightID))).first(Flight.class).orElseThrow();
        Integer actualNumberOfOccupiedSeats = flightAfterUpdate.occupiedSeats();

        assertEquals(expectedNrOcSeats, actualNumberOfOccupiedSeats);

    }

    @Test
    @WithMockUser("amy")
    void testUpdateFlightHandlerForUpdatedBooking() {
        if (environment.acceptsProfiles(Profiles.of("cloud"))) {
            return; // skip in cloud
        }

        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq("72757221A8E4645C17002DF03754AB66"))
                .columns(Travel_::TravelUUID, Travel_::BeginDate, t -> t.to_Booking()
                        .expand(Booking_::BookingUUID, b -> b.to_Flight()
                                .expand(Flight_::ConnectionID, Flight_::OccupiedSeats)));

        Travel travel = travelService.run(querySelect).single(Travel.class);

        // Get one flight to be updated and get its expected number of occupied seats
        // after update
        List<Booking> bookingActEnt = travel.toBooking();
        Booking bookingToBeUpdated = bookingActEnt.getFirst();
        Flight flightToBeRemoved = bookingToBeUpdated.toFlight();
        String flightToBeRemovedID = flightToBeRemoved.connectionID();
        Integer flightToBeRemovedExpSeats = flightToBeRemoved.occupiedSeats() - 1;

        // Get some random flight and get its expected number of seats after update
        Flight flightToBeAdded = dbService.run(Select.from(FLIGHT).where(f -> f.FlightDate().eq(travel.beginDate()))).first(Flight.class).orElseThrow();
        String flightToBeAddedID = flightToBeAdded.connectionID();
        Integer flightToBeAddedExpSeats = flightToBeAdded.occupiedSeats() + 1;

        // Compose an updated version of the entity which was retrieved before
        Booking newBooking = travel.toBooking().getFirst();
        newBooking.toFlight(flightToBeAdded);
        travel.toBooking().set(0, newBooking);
        addRequiredDataToTravel(travel);

        CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travel);
        travelService.run(queryUpdate);

        Flight flightRemoved = dbService
                .run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(flightToBeRemovedID))).first(Flight.class).orElseThrow();
        Integer flightRemovedActNuOcSeats = flightRemoved.occupiedSeats();

        Flight flightAdded = dbService
                .run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(flightToBeAddedID))).first(Flight.class).orElseThrow();
        Integer flightAddedActNuOcSeats = flightAdded.occupiedSeats();

        assertEquals(flightToBeRemovedExpSeats, flightRemovedActNuOcSeats);
        assertEquals(flightToBeAddedExpSeats, flightAddedActNuOcSeats);

    }

    private static void addRequiredDataToTravel(Travel travel) {
        // travel.beginDate(LocalDate.now().plusDays(1));
        // travel.endDate(LocalDate.now().plusDays(2));
    }

}
