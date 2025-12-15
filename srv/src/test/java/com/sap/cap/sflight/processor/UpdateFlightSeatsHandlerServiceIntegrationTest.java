package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.TravelService_.FLIGHT;
import static cds.gen.travelservice.TravelService_.TRAVEL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.test.context.support.WithMockUser;

import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.travelservice.Booking;
import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Flight;
import cds.gen.travelservice.Flight_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService;
import cds.gen.travelservice.Travel_;

@SpringBootTest
class UpdateFlightSeatsHandlerServiceIntegrationTest {

    @Autowired
    private TravelService travelService;

    @Autowired
    private PersistenceService dbService;

    @Autowired
    private Environment environment;

    // Store original flight occupied seats to restore after each test
    private Map<String, Integer> originalFlightSeats = new HashMap<>();
    
    // Store the original travel state to restore after each test
    private Travel originalTravelState;
    
    private static final String TEST_TRAVEL_UUID = "72757221A8E4645C17002DF03754AB66";

    @BeforeEach
    void setUp() {
        // Capture original travel state
        originalTravelState = getCompleteTravel(TEST_TRAVEL_UUID);
        
        // Capture original flight occupied seats for all flights that might be affected
        List<String> flightConnectionIds = List.of("0001", "0002", "0003", "0400");
        for (String connectionId : flightConnectionIds) {
            Flight flight = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(connectionId)))
                    .first(Flight.class).orElse(null);
            if (flight != null) {
                originalFlightSeats.put(connectionId, flight.occupiedSeats());
            }
        }
    }

    @AfterEach
    void tearDown() {
        // Restore original flight occupied seats
        for (Map.Entry<String, Integer> entry : originalFlightSeats.entrySet()) {
            String connectionId = entry.getKey();
            Integer originalSeats = entry.getValue();
            if (originalSeats != null) {
                CqnUpdate resetSeats = Update.entity(FLIGHT)
                        .where(f -> f.ConnectionID().eq(connectionId)).data(Map.of("OccupiedSeats", originalSeats));
                dbService.run(resetSeats);
            }
        }
        
        // Restore original travel state by updating with original bookings
        if (originalTravelState != null) {
            addRequiredDataToTravel(originalTravelState);
            CqnUpdate restoreTravel = Update.entity(TRAVEL).data(originalTravelState);
            travelService.run(restoreTravel);
        }
        
        // Clear the maps for next test
        originalFlightSeats.clear();
    }

    private Travel getCompleteTravel(String travelUUID) {
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq(travelUUID))
                .columns(Travel_::TravelUUID, Travel_::BeginDate, Travel_::EndDate, 
                        t -> t.to_Booking().expand(Booking_::BookingUUID, 
                                b -> b.to_Flight().expand(Flight_::ConnectionID, Flight_::OccupiedSeats)));
        return travelService.run(querySelect).single(Travel.class);
    }

    @Test
    @WithMockUser("amy")
    void testUpdateFlightHandlerForAddedBooking() {
        // Retrieve some flight to add it to the new booking
        String testFlightConnectionId = "0001";
        Flight flightBeforeAdded = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(testFlightConnectionId))).first(Flight.class).orElseThrow();
        Integer numberOcSeatsBeforeAdded = flightBeforeAdded.occupiedSeats();
        Integer expectedNrOcSeats = numberOcSeatsBeforeAdded + 1;

        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq(TEST_TRAVEL_UUID))
                .columns(Travel_::TravelUUID, t -> t.to_Booking()
                        .expand(Booking_::BookingUUID, b -> b.to_Flight()
                                .expand(Flight_::ConnectionID, Flight_::OccupiedSeats)));

        Travel travel = travelService.run(querySelect).single(Travel.class);

        // Compose an updated version of the entity which was retrieved before
        Booking addedBooking = Booking.create();
        addedBooking.bookingUUID("test-added-booking-" + System.currentTimeMillis());
        Flight flight = Flight.create();
        flight.connectionID(testFlightConnectionId);
        addedBooking.toFlight(flight);
        travel.toBooking().add(addedBooking);
        addRequiredDataToTravel(travel);

        CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travel);
        travelService.run(queryUpdate);

        Flight flightAfterUpdate = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(testFlightConnectionId))).first(Flight.class).orElseThrow();
        Integer actualNumberOfOccupiedSeats = flightAfterUpdate.occupiedSeats();

        assertEquals(expectedNrOcSeats, actualNumberOfOccupiedSeats);
    }

    @Test
    @WithMockUser("amy")
    void testUpdateFlightHandlerForDeletedBooking() {
        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq(TEST_TRAVEL_UUID))
                .columns(Travel_::TravelUUID, t -> t.to_Booking()
                        .expand(Booking_::BookingUUID, b -> b.to_Flight()
                                .expand(Flight_::ConnectionID, Flight_::OccupiedSeats)));

        Travel travel = travelService.run(querySelect).single(Travel.class);

        // Only proceed if there are bookings to delete
        if (travel.toBooking() == null || travel.toBooking().isEmpty()) {
            return; // Skip test if no bookings available
        }

        // Compose an updated version of the entity which was retrieved before
        Flight flightToBeDeleted = travel.toBooking().getFirst().toFlight();
        if (flightToBeDeleted == null || flightToBeDeleted.connectionID() == null) {
            return; // Skip test if flight data is incomplete
        }
        
        String flightID = flightToBeDeleted.connectionID();
        Integer numberOcSeatsBeforeDeleted = flightToBeDeleted.occupiedSeats();
        Integer expectedNrOcSeats = numberOcSeatsBeforeDeleted - 1;
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
        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq(TEST_TRAVEL_UUID))
                .columns(Travel_::TravelUUID, t -> t.to_Booking()
                        .expand(Booking_::BookingUUID, b -> b.to_Flight()
                                .expand(Flight_::ConnectionID, Flight_::OccupiedSeats)));

        Travel travel = travelService.run(querySelect).single(Travel.class);

        // Only proceed if there are bookings to update
        if (travel.toBooking() == null || travel.toBooking().isEmpty()) {
            return; // Skip test if no bookings available
        }

        // Get one flight to be updated and get its expected number of occupied seats
        // after update
        List<Booking> bookingActEnt = travel.toBooking();
        Booking bookingToBeUpdated = bookingActEnt.getFirst();
        Flight flightToBeRemoved = bookingToBeUpdated.toFlight();
        if (flightToBeRemoved == null || flightToBeRemoved.connectionID() == null) {
            return; // Skip test if flight data is incomplete
        }
        
        String flightToBeRemovedID = flightToBeRemoved.connectionID();
        Integer flightToBeRemovedExpSeats = flightToBeRemoved.occupiedSeats() - 1;

        // Get some different flight and get its expected number of seats after update
        String newFlightConnectionId = "0002"; // Use different flight to avoid same-flight update
        Flight flightToBeAdded = dbService.run(Select.from(FLIGHT).where(f -> f.ConnectionID().eq(newFlightConnectionId))).first(Flight.class).orElseThrow();
        String flightToBeAddedID = flightToBeAdded.connectionID();
        Integer flightToBeAddedExpSeats = flightToBeAdded.occupiedSeats() + 1;

        // Compose an updated version of the entity which was retrieved before
        Booking newBooking = travel.toBooking().getFirst();
        Flight newFlightReference = Flight.create();
        newFlightReference.connectionID(newFlightConnectionId);
        newBooking.toFlight(newFlightReference);
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
        travel.beginDate(LocalDate.now().plusDays(1));
        travel.endDate(LocalDate.now().plusDays(2));
    }

    @Test
    @WithMockUser("amy")
    void testUpdateFlightHandlerWithEmptyBookingList() {
        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq(TEST_TRAVEL_UUID))
                .columns(Travel_::TravelUUID);

        Travel travel = travelService.run(querySelect).single(Travel.class);
        
        // Set an empty booking list
        travel.toBooking(new ArrayList<>());
        addRequiredDataToTravel(travel);

        // This should not throw an exception
        assertDoesNotThrow(() -> {
            CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travel);
            travelService.run(queryUpdate);
        });
    }

    @Test
    @WithMockUser("amy")
    void testUpdateFlightHandlerWithNullFlightReference() {
        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq(TEST_TRAVEL_UUID))
                .columns(Travel_::TravelUUID, t -> t.to_Booking().expand(Booking_::BookingUUID));

        Travel travel = travelService.run(querySelect).single(Travel.class);
        
        // Add booking with null flight reference
        Booking bookingWithNullFlight = Booking.create();
        bookingWithNullFlight.bookingUUID("null-flight-test-" + System.currentTimeMillis());
        bookingWithNullFlight.toFlight(null); // Null flight reference
        travel.toBooking().add(bookingWithNullFlight);
        addRequiredDataToTravel(travel);
        
        // This should not throw an exception
        assertDoesNotThrow(() -> {
            CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travel);
            travelService.run(queryUpdate);
        });
    }

    @Test
    @WithMockUser("amy")
    void testUpdateFlightHandlerWithMissingConnectionID() {
        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq(TEST_TRAVEL_UUID))
                .columns(Travel_::TravelUUID, t -> t.to_Booking().expand(Booking_::BookingUUID));

        Travel travel = travelService.run(querySelect).single(Travel.class);
        
        // Add booking with flight missing ConnectionID
        Booking bookingWithIncompleteFlightData = Booking.create();
        bookingWithIncompleteFlightData.bookingUUID(UUID.randomUUID().toString());
        Flight incompleteFlightData = Flight.create();
        // Not setting ConnectionID
        bookingWithIncompleteFlightData.toFlight(incompleteFlightData);
        travel.toBooking().add(bookingWithIncompleteFlightData);
        addRequiredDataToTravel(travel);
        
        // This should not throw an exception
        assertDoesNotThrow(() -> {
            CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travel);
            travelService.run(queryUpdate);
        });
    }

    @Test
    @WithMockUser("amy")
    void testUpdateFlightHandlerWithMultipleEdgeCases() {
        // Query some active entity
        CqnSelect querySelect = Select.from(Travel_.class)
                .where(t -> t.TravelUUID().eq(TEST_TRAVEL_UUID))
                .columns(Travel_::TravelUUID, t -> t.to_Booking().expand(Booking_::BookingUUID));

        Travel travel = travelService.run(querySelect).single(Travel.class);
        
        // Clear existing bookings and add a mix of valid and problematic bookings
        travel.toBooking(new ArrayList<>());
        
        // Add a valid booking
        Booking validBooking = Booking.create();
        validBooking.bookingUUID("valid-booking-" + System.currentTimeMillis());
        Flight validFlight = Flight.create();
        validFlight.connectionID("0003"); // Use a different connection ID to avoid conflicts
        validBooking.toFlight(validFlight);
        travel.toBooking().add(validBooking);
        
        // Add booking with null flight
        Booking nullFlightBooking = Booking.create();
        nullFlightBooking.bookingUUID(UUID.randomUUID().toString());
        nullFlightBooking.toFlight(null);
        travel.toBooking().add(nullFlightBooking);
        
        // Add booking with flight missing ConnectionID
        Booking missingConnectionBooking = Booking.create();
        missingConnectionBooking.bookingUUID(UUID.randomUUID().toString());
        Flight incompleteFlightData = Flight.create();
        // Not setting ConnectionID
        missingConnectionBooking.toFlight(incompleteFlightData);
        travel.toBooking().add(missingConnectionBooking);
        
        addRequiredDataToTravel(travel);
        
        // This should not throw an exception
        assertDoesNotThrow(() -> {
            CqnUpdate queryUpdate = Update.entity(TRAVEL).data(travel);
            travelService.run(queryUpdate);
        });
    }
}
