package com.sap.cap.sflight.processor;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@SpringBootTest
@AutoConfigureMockMvc
class TravelSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser("admin")
    void testReadTravels() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/processor/Travel")).andExpect(status().isOk())
                .andExpect(jsonPath("$.value[0].TravelID").value(equalTo(175)))
                .andExpect(jsonPath("$.value[0].createdBy").value(containsString("Hansmann")))
                .andExpect(jsonPath("$.value[0].LastChangedBy").value(containsString("Deichgraeber")))
                .andExpect(jsonPath("$.value[1].TravelID").value(equalTo(431)))
                .andExpect(jsonPath("$.value[1].createdBy").value(containsString("Mueller")))
                .andExpect(jsonPath("$.value[1].LastChangedBy").value(containsString("Lautenbach"))) ;
    }
}
