package com.sap.cap.sflight.processor;

import org.springframework.stereotype.Component;

import com.sap.cds.ql.CQL;
import com.sap.cds.ql.Select;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.travelservice.Booking_;
import cds.gen.travelservice.Travel;
import cds.gen.travelservice.TravelService_;
import cds.gen.travelservice.Travel_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class TravelBookingUpdatedHandler implements EventHandler {
    

	@Before(event = {CqnService.EVENT_UPDATE, CqnService.EVENT_CREATE}, entity = Travel_.CDS_NAME)
    public void onTravelUpdate(Travel travel) {


        Select<Booking_> allTravels = Select.from(Booking_.class)
            .columns(c -> CQL.count(c.ConnectionID()).as("seats"))
            .where(b -> b.to_Travel_TravelUUID().eq(travel.travelUUID()))
            .groupBy(g -> g.ConnectionID());
    }
}
