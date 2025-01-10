package com.sap.cap.sflight.processor;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.Flight;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;
import com.sap.cds.Result;
import com.sap.cds.ql.Insert;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnInsert;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.persistence.PersistenceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static cds.gen.travelservice.TravelService_.FLIGHT;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@SpringBootTest
public class UpdateFlightSeatsHandlerServiceIntegrationTest {

    @Autowired
    @Qualifier(TravelService_.CDS_NAME)
    private CqnService travelService;

    @Autowired
    private PersistenceService dbService;

    /* 
    @Test
    @WithMockUser("amy")
    public void testHandlerForDeletedTravel() {

        // Query some existing entity, which is going to be deleted
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq("72757221A8E4645C17002DF03754AB66"))
                .columns(t -> t.TravelUUID(), t -> t.to_Booking()
                        .expand(b -> b.BookingUUID(), b -> b.to_Flight()
                                .expand(f -> f.ConnectionID(), f -> f.OccupiedSeats())));

        Result rs = travelService.run(querySelect);
        Travel travelActEnt = rs.single(Travel.class);

        List<Booking> bookings = travelActEnt.toBooking();

        HashMap<Flight, Integer> expectedNrOcSeats = new HashMap<Flight, Integer>();

        for (Booking b : bookings) {
            
            expectedNrOcSeats.put(b.toFlight(), b.toFlight().occupiedSeats() - 1);
        }

        CqnDelete deleteStatement = Delete.from(Travel_.class)
                .where(t -> t.TravelUUID().eq("72757221A8E4645C17002DF03754AB66"));
        travelService.run(deleteStatement);

        HashMap<Flight, Integer> actueldNrOcSeats = new HashMap<Flight, Integer>();
        for (Booking b : bookings) {
            Result result = dbService
                    .run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(b.toFlight().connectionID())));
            Optional<Flight> opt = result.first(Flight.class);
            Flight f = opt.get();
            actueldNrOcSeats.put(f, f.occupiedSeats());

        }

        assertEquals(expectedNrOcSeats, actueldNrOcSeats);

    }
 */
    @Test
    @WithMockUser("amy")
    public void testUpdateFlightHandlerForAddedBooking() {

        // Retrieve some flight to add it to the new booking
        Result result = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq("0001")));
        Optional<Flight> flightBeforeAddedOpt = result.first(Flight.class);
        Flight flightBeforeAdded = flightBeforeAddedOpt.get();
        Integer numberOcSeatsBeforeAdded = flightBeforeAdded.occupiedSeats();
        Integer expectedNrOcSeats = numberOcSeatsBeforeAdded + 1;

        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq("72757221A8E4645C17002DF03754AB66"))
                .columns(t -> t.TravelUUID(), t -> t.to_Booking()
                        .expand(b -> b.BookingUUID(), b -> b.to_Flight()
                                .expand(f -> f.ConnectionID(), f -> f.OccupiedSeats())));

        Result rs = travelService.run(querySelect);
        Travel travelActEnt = rs.single(Travel.class);

        // Compose an updated version of the entity which was retrieved before
        Travel travelUpdate = travelActEnt;
        Booking addedBooking = Booking.create();
        addedBooking.bookingUUID("c0adcdc4-47c0-48d9-9787-46a15927c357");
        Flight flight = Flight.create();
        flight.connectionID("0001");
        addedBooking.toFlight(flight);
        travelUpdate.toBooking().add(addedBooking);

        List<Travel> travelUpdates = new ArrayList<>();
        travelUpdates.add(travelUpdate);

        // CqnUpsert queryUpsert = Upsert.into(TRAVEL).entries(travelUpdates);
        CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travelUpdate);
        travelService.run(queryUpdate);

        Result result1 = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq("0001")));
        Optional<Flight> flightAfterUpdateOpt = result1.first(Flight.class);
        Flight flightAfterUpdate = flightAfterUpdateOpt.get();
        Integer actualNumberOfOccupiedSeats = flightAfterUpdate.occupiedSeats();

        assertEquals(expectedNrOcSeats, actualNumberOfOccupiedSeats);

    }

    @Test
    @WithMockUser("amy")
    public void testUpdateFlightHandlerForNewlyCreatedTravels() {

        // Get some random flight from the db
        Result result = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq("0001")));
        Optional<Flight> flightBeforeAddedOpt = result.first(Flight.class);
        Flight flightBeforeAdded = flightBeforeAddedOpt.get();
        Integer numberOcSeatsBeforeAdded = flightBeforeAdded.occupiedSeats();
        Integer expectedNrOcSeats = numberOcSeatsBeforeAdded + 1;

        // Compose a new entity to be inserted
        Travel travelCreate = Travel.create();
        travelCreate.travelUUID("8a4e71a3-c3b3-495f-a260-97e605d2fab0");
        Booking addedBooking = Booking.create();
        addedBooking.bookingUUID("1c46db1e-aa98-4709-b5f9-cfa8f0c3e01b");
        Flight flight = Flight.create();
        flight.connectionID("0001");
        addedBooking.toFlight(flight);
        List<Booking> bookings = new ArrayList<>();
        bookings.add(addedBooking);
        travelCreate.toBooking(bookings);

        CqnInsert queryUpdate = Insert.into(TRAVEL).entry(travelCreate);
        travelService.run(queryUpdate);

        Result result1 = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq("0001")));
        Optional<Flight> flightAfterUpdateOpt = result1.first(Flight.class);
        Flight flightAfterUpdate = flightAfterUpdateOpt.get();
        Integer actualNumberOfOccupiedSeats = flightAfterUpdate.occupiedSeats();

        assertEquals(expectedNrOcSeats, actualNumberOfOccupiedSeats);

    }

    @Test
    @WithMockUser("amy")
    public void testUpdateFlightHandlerForDeletedBooking() {

        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq("72757221A8E4645C17002DF03754AB66"))
                .columns(t -> t.TravelUUID(), t -> t.to_Booking()
                        .expand(b -> b.BookingUUID(), b -> b.to_Flight()
                                .expand(f -> f.ConnectionID(), f -> f.OccupiedSeats())));

        Result rs = travelService.run(querySelect);
        Travel travelActEnt = rs.single(Travel.class);

        // Compose an updated version of the entity which was retrieved before
        Travel travelUpdate = travelActEnt;
        Flight flightToBeDeleted = travelActEnt.toBooking().get(0).toFlight();
        String flightID = flightToBeDeleted.connectionID();
        Integer numberOcSeatsBeforeAdded = flightToBeDeleted.occupiedSeats();
        Integer expectedNrOcSeats = numberOcSeatsBeforeAdded - 1;
        travelUpdate.toBooking().remove(0);

        List<Travel> travelUpdates = new ArrayList<>();
        travelUpdates.add(travelUpdate);

        // CqnUpsert queryUpsert = Upsert.into(TRAVEL).entries(travelUpdates);
        CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travelUpdate);
        travelService.run(queryUpdate);

        Result result1 = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(flightID)));
        Optional<Flight> flightAfterUpdateOpt = result1.first(Flight.class);
        Flight flightAfterUpdate = flightAfterUpdateOpt.get();
        Integer actualNumberOfOccupiedSeats = flightAfterUpdate.occupiedSeats();

        assertEquals(expectedNrOcSeats, actualNumberOfOccupiedSeats);

    }

    @Test
    @WithMockUser("amy")
    public void testUpdateFlightHandlerForUpdatedBooking() {

        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq("72757221A8E4645C17002DF03754AB66"))
                .columns(t -> t.TravelUUID(), t -> t.to_Booking()
                        .expand(b -> b.BookingUUID(), b -> b.to_Flight()
                                .expand(f -> f.ConnectionID(), f -> f.OccupiedSeats())));

        Result rs = travelService.run(querySelect);
        Travel travelActEnt = rs.single(Travel.class);

        // Get one flight to be updated and get its expected number of occupied seats
        // after update
        List<Booking> bookingActEnt = travelActEnt.toBooking();
        Booking bookingToBeUpdated = bookingActEnt.get(0);
        Flight flightToBeRemoved = bookingToBeUpdated.toFlight();
        String flightToBeRemovedID = flightToBeRemoved.connectionID();
        Integer flightToBeRemovedExpSeats = flightToBeRemoved.occupiedSeats() - 1;

        // Get some random flight and get its expected number of seats after update
        Result result = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq("0001")));
        Optional<Flight> flightBeforeAddedOpt = result.first(Flight.class);
        Flight flightToBeAdded = flightBeforeAddedOpt.get();
        String flightToBeAddedID = flightToBeAdded.connectionID();
        Integer flightToBeAddedExpSeats = flightToBeAdded.occupiedSeats() + 1;

        // Compose an updated version of the entity which was retrieved before
        Travel travelUpdate = travelActEnt;
        List<Booking> booking = travelUpdate.toBooking();
        Booking newBooking = booking.get(0);
        newBooking.toFlight(flightToBeAdded);
        travelUpdate.toBooking().set(0, newBooking);
        List<Travel> travelUpdates = new ArrayList<>();
        travelUpdates.add(travelUpdate);

        CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travelUpdate);
        travelService.run(queryUpdate);

        Result resultFlightRemoved = dbService
                .run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(flightToBeRemovedID)));
        Optional<Flight> opt1 = resultFlightRemoved.first(Flight.class);
        Flight flightRemoved = opt1.get();
        Integer flightRemovedActNuOcSeats = flightRemoved.occupiedSeats();

        Result resultFlightAdded = dbService
                .run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(flightToBeAddedID)));
        Optional<Flight> opt2 = resultFlightAdded.first(Flight.class);
        Flight flightAdded = opt2.get();
        Integer flightAddedActNuOcSeats = flightAdded.occupiedSeats();

        assertEquals(flightToBeRemovedExpSeats, flightRemovedActNuOcSeats);
        assertEquals(flightToBeAddedExpSeats, flightAddedActNuOcSeats);

    }

}