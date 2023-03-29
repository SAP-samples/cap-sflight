package com.sap.cap.sflight.reviewer;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.reviewservice.ReviewService_;
import cds.gen.reviewservice.Reviewed;
import cds.gen.reviewservice.ReviewedContext;
import cds.gen.reviewservice.TravelReview_;

@Component
@ServiceName(ReviewService_.CDS_NAME)
public class ReviewHandler implements EventHandler {

	@Qualifier(ReviewService_.CDS_NAME)
	private final CqnService reviewService;

	public ReviewHandler( CqnService reviewService) {
		this.reviewService = reviewService;
	}

	@After(event = { CqnService.EVENT_CREATE, CqnService.EVENT_UPDATE, CqnService.EVENT_UPSERT,
			CqnService.EVENT_DELETE }, entity = TravelReview_.CDS_NAME)
	public void afterReviewWrite() {

		//TODO: read the actual review data

		Reviewed reviewed = Reviewed.create();
		reviewed.setCount(1);
		reviewed.setRating(BigDecimal.valueOf(5L));
		reviewed.setSubject(42);

		ReviewedContext reviewedContext = ReviewedContext.create();
		reviewedContext.setData(reviewed);
	
		reviewService.emit(reviewedContext);
	}
}
