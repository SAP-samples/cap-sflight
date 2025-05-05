package com.sap.cap.sflight.processor;

import static org.junit.jupiter.api.Assertions.*;

import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService;
import cds.gen.travelservice.Travel_;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.services.ServiceException;
import com.sap.cds.services.persistence.PersistenceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.EnabledIf;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@EnabledIf(value = "#{environment.matchesProfiles('!cloud')}")
class AcceptRejectActionTest {

    @Autowired
    private PersistenceService dbService;
    @Autowired
    private TravelService travelService;

    @Test
    @WithMockUser("amy")
    void acceptTravel_success() {
        CqnSelect querySelect = Select.from(Travel_.class)
            .where(t -> t.TravelUUID().eq("71757221A8E4645C17002DF03754AB66"))
            .columns(Travel_::TravelUUID, Travel_::TravelStatus_code);
        Travel travel = travelService.run(querySelect).single(Travel.class);
        assertEquals("O", travel.travelStatusCode());

        travelService.acceptTravel(travel.ref());

        Travel travelAfter = travelService.run(querySelect).single(Travel.class);
        assertEquals("A", travelAfter.travelStatusCode());
    }

    @Test
    @WithMockUser("amy")
    void acceptTravel_invalidEntryState() {
        CqnSelect querySelect = Select.from(Travel_.class)
            .where(t -> t.TravelUUID().eq("73757221A8E4645C17002DF03754AB66"))
            .columns(Travel_::TravelUUID, Travel_::TravelStatus_code);
        Travel travel = travelService.run(querySelect).single(Travel.class);
        assertEquals("X", travel.travelStatusCode());

        var exception = assertThrows(ServiceException.class, () -> travelService.acceptTravel(travel.ref()));
        assertEquals("Invalid entry state for transition. Action requires 'TravelStatus' to be one of '[O]', but was 'X'.", exception.getLocalizedMessage());
    }

    @Test
    @WithMockUser("amy")
    void rejectTravel_success() {
        CqnSelect querySelect = Select.from(Travel_.class)
            .where(t -> t.TravelUUID().eq("72757221A8E4645C17002DF03754AB66"))
            .columns(Travel_::TravelUUID, Travel_::TravelStatus_code);
        Travel travel = travelService.run(querySelect).single(Travel.class);
        assertEquals("O", travel.travelStatusCode());

        travelService.rejectTravel(travel.ref());

        Travel travelAfter = travelService.run(querySelect).single(Travel.class);
        assertEquals("X", travelAfter.travelStatusCode());
    }

    @Test
    @WithMockUser("amy")
    void rejectTravel_invalidEntryState() {
        CqnSelect querySelect = Select.from(Travel_.class)
            .where(t -> t.TravelUUID().eq("73757221A8E4645C17002DF03754AB66"))
            .columns(Travel_::TravelUUID, Travel_::TravelStatus_code);
        Travel travel = travelService.run(querySelect).single(Travel.class);
        assertEquals("X", travel.travelStatusCode());

        var exception = assertThrows(ServiceException.class, () -> travelService.rejectTravel(travel.ref()));
        assertEquals("Invalid entry state for transition. Action requires 'TravelStatus' to be one of '[O]', but was 'X'.", exception.getLocalizedMessage());
    }

}