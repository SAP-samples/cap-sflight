package com.sap.cap.sflight.processor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.remotereviewservice.RemoteReviewService_;
import cds.gen.remotereviewservice.ReviewedContext;
import cds.gen.travelservice.TravelService_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class TravelReviewChangedHandler implements EventHandler {

	private static final Logger logger = LoggerFactory.getLogger(TravelReviewChangedHandler.class);

	@On(service = RemoteReviewService_.CDS_NAME)
	public void onReviewChanged(ReviewedContext context) {
		
		logger.info("received " + context.getData().toJson());

	}
	
}
