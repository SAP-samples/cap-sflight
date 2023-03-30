package com.sap.cap.sflight.processor;

import static cds.gen.travelservice.Travel.AVG_REVIEW_RATING;
import static cds.gen.travelservice.TravelService_.TRAVEL;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.cds.ql.Update;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.reviewservice.ReviewService_;
import cds.gen.reviewservice.ReviewedContext;
import cds.gen.travelservice.TravelService_;

@Component
@ServiceName(TravelService_.CDS_NAME)
public class TravelReviewChangedHandler implements EventHandler {

	private static final Logger logger = LoggerFactory.getLogger(TravelReviewChangedHandler.class);

	private final CqnService travelService;

	public TravelReviewChangedHandler(CqnService travelService) {
		this.travelService = travelService;
	}

	@On(service = ReviewService_.CDS_NAME)
	public void onReviewChanged(ReviewedContext context) {
		
		BigDecimal rating = context.getData().getRating();
		Integer travelId = context.getData().getSubject();

		Map<String, Integer> updateFilter = new HashMap<>();
		updateFilter.put("TravelID", travelId);

		travelService.run(Update.entity(TRAVEL, t -> t.matching(updateFilter)).data(AVG_REVIEW_RATING, rating));
		logger.info("Successfully updated travel with travelId {} with a new average rating of {}.", travelId, rating);
	}
	
}
