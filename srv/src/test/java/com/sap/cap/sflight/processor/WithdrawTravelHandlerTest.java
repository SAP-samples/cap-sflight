package com.sap.cap.sflight.processor;

import static java.lang.Boolean.FALSE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService;
import cds.gen.travelservice.TravelWithdrawTravelContext;
import cds.gen.travelservice.Travel_;
import com.sap.cds.ql.CQL;
import com.sap.cds.ql.Insert;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.cqn.CqnAnalyzer;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnStatement;
import com.sap.cds.ql.cqn.CqnStructuredTypeRef;
import com.sap.cds.services.EventContext;
import com.sap.cds.services.ServiceException;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.draft.Drafts;
import com.sap.cds.services.messages.Message;
import com.sap.cds.services.messages.Message.Severity;
import com.sap.cds.services.persistence.PersistenceService;
import com.sap.cds.services.runtime.CdsRuntime;
import com.sap.cds.services.utils.DraftUtils;
import java.util.Optional;
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
class WithdrawTravelHandlerTest {

    @Autowired
    private PersistenceService dbService;
    @Autowired
    private TravelService travelService;
    @Autowired
    private CdsRuntime runtime;

    @Test
    @WithMockUser("amy")
    void testOnWithdrawTravel_invalidEntryState() {
        CqnSelect querySelect = Select.from(Travel_.class,
                f -> f.filter(t -> t.TravelUUID().eq("73757221A8E4645C17002DF03754AB66")))
            .columns(Travel_::TravelUUID, Travel_::TravelStatus_code);
        Travel travel = travelService.run(querySelect).single(Travel.class);
        assertEquals("X", travel.travelStatusCode());

        var exception = assertThrows(ServiceException.class, () -> travelService.withdrawTravel(travel.ref()));
        assertEquals(
            "Invalid entry state for transition. Action requires 'TravelStatus' to be one of '[O, A]', but was 'X'.",
            exception.getLocalizedMessage());
    }

    @Test
    @WithMockUser("amy")
    void testOnWithdrawTravel_withdrawingStillPossible() {
        CqnSelect querySelect = Select.from(Travel_.class,
                f -> f.filter(t -> t.TravelUUID().eq("76757221A8E4645C17002DF03754AB66")))
            .columns(Travel_::TravelUUID, Travel_::TravelStatus_code);
        Travel travel = travelService.run(querySelect).single(Travel.class);
        assertEquals("A", travel.travelStatusCode());

        travelService.withdrawTravel(travel.ref());

        Travel travelAfter = travelService.run(querySelect).single(Travel.class);
        assertEquals("W", travelAfter.travelStatusCode());
    }

    @Test
    @WithMockUser("amy")
    void testOnWithdrawTravel_afterWithdrawalPossible() {
        CqnSelect querySelect = Select.from(Travel_.class,
                f -> f.filter(t -> t.TravelUUID().eq("67757221A8E4645C17002DF03754AB66")))
            .columns(Travel_::TravelUUID, Travel_::TravelStatus_code);
        Travel travel = travelService.run(querySelect).single(Travel.class);
        assertEquals("A", travel.travelStatusCode());

        var exception = assertThrows(ServiceException.class,
            () -> travelService.withdrawTravel(travel.ref()));
        assertEquals("Travel can only be withdrawn up to 24 hours before travel begins.",
            exception.getLocalizedMessage());
        Travel travelAfter = travelService.run(querySelect).single(Travel.class);
        assertEquals("A", travelAfter.travelStatusCode());
    }

    @Test
    @WithMockUser("amy")
    void testOnWithdrawTravel_draft_withdrawingStillPossible() {
        CqnSelect selectActive = Select.from(Travel_.class,
            f -> f.filter(t -> t.TravelUUID().eq("75757221A8E4645C17002DF03754AB66").and(t.IsActiveEntity().eq(true))));
        var travel = travelService.run(selectActive).single(Travel.class);
        assertEquals("O", travel.travelStatusCode());
        DraftService draftService = (DraftService) travelService;
        draftService.newDraft(Insert.into(Travel_.class).entry(travel)).single(Travel.class).ref();

        Travel_ draftRef = CQL.entity(Travel_.class).filter(t -> t.TravelUUID().eq("75757221A8E4645C17002DF03754AB66").and(t.IsActiveEntity().eq(false)));
        travelService.withdrawTravel(draftRef);


        Travel activeTravelAfter = travelService.run(selectActive).single(Travel.class);
        assertEquals("O", activeTravelAfter.travelStatusCode(), "active Travel should be unchanged");
        Travel draftTravelAfter = travelService.run(Select.from(draftRef)).single(Travel.class);
        assertEquals("W", draftTravelAfter.travelStatusCode(), "draft Travel should be changed");
    }

    public boolean isDraftEnabledAndActive(CqnStructuredTypeRef ref) {
        return DraftUtils.isDraftEnabled(runtime.getCdsModel().findEntity(ref.targetSegment().id()).get())
            && isActiveEntity(ref);
    }

    public boolean isActiveEntity(CqnStructuredTypeRef ref) {
        Object isActiveEntity = CqnAnalyzer.create(runtime.getCdsModel()).analyze(ref).targetKeys()
            .get(Drafts.IS_ACTIVE_ENTITY);
        return isActiveEntity instanceof Boolean bool && bool;
    }

    public boolean isInactiveEntity(CqnStructuredTypeRef ref) {
        Object isActiveEntity = CqnAnalyzer.create(runtime.getCdsModel()).analyze(ref).targetKeys()
            .get(Drafts.IS_ACTIVE_ENTITY);
        return (isActiveEntity instanceof Boolean bool && !bool.booleanValue());
    }

    public boolean isDraft(CqnStructuredTypeRef ref) {
        return DraftUtils.isDraftTarget(ref, runtime.getCdsModel().findEntity(Travel_.CDS_NAME).get(),
            runtime.getCdsModel());
    }

    void verifyError(Runnable action, String errorMessage) {
        runtime.requestContext().run(r -> {
            action.run();

            Optional<Message> message = r.getMessages().stream().findFirst();
            assertThat(message).hasValueSatisfying(m -> {
                assertThat(m.getSeverity()).isEqualTo(Severity.ERROR);
                assertThat(m.getMessage()).isEqualTo(errorMessage);
            });
        });
    }
}