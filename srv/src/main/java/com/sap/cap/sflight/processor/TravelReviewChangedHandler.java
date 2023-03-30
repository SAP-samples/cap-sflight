package com.sap.cap.sflight.processor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.reviewservice.ReviewService_;
import cds.gen.reviewservice.ReviewedContext;
import cds.gen.travelservice.TravelReviewedContext;
import cds.gen.travelservice.TravelService_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class TravelReviewChangedHandler implements EventHandler {

	private static final Logger logger = LoggerFactory.getLogger(TravelReviewChangedHandler.class);

	@On(service = ReviewService_.CDS_NAME)
	public void onReviewChanged(ReviewedContext context) {
		
		logger.info("received " + context.getData().toJson());

	}
	
}
