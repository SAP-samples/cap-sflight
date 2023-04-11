package com.sap.cap.sflight.reviewer;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.sap.cds.Row;
import com.sap.cds.ql.Select;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.reviewservice.ReviewService_;
import cds.gen.reviewservice.Reviewed;
import cds.gen.reviewservice.ReviewedContext;
import cds.gen.reviewservice.TravelReview;
import cds.gen.reviewservice.TravelReview_;

@Component
@ServiceName(ReviewService_.CDS_NAME)
public class ReviewHandler implements EventHandler {

	private final CqnService reviewService;

	public ReviewHandler(@Qualifier(ReviewService_.CDS_NAME) CqnService reviewService) {
		this.reviewService = reviewService;
	}

	@After(event = { CqnService.EVENT_CREATE, CqnService.EVENT_UPDATE, CqnService.EVENT_UPSERT,
			CqnService.EVENT_DELETE }, entity = TravelReview_.CDS_NAME)
	public void afterReviewWrite(TravelReview travelReview) {

		Select<TravelReview_> averageRatingQuery = Select.from(ReviewService_.TRAVEL_REVIEW)
				.columns(t -> t.Rating().average().as("average"), t -> t.Rating().countDistinct().as("reviewCount"))
				.where(t -> t.TravelID().eq(travelReview.getTravelID()));

		Row resultRow = reviewService.run(averageRatingQuery).single();
		

		Reviewed reviewed = Reviewed.create();
		reviewed.setCount(Integer.valueOf(resultRow.get("reviewCount").toString()));
		reviewed.setRating(BigDecimal.valueOf(5L));
		reviewed.setSubject(travelReview.getTravelID());

		ReviewedContext reviewedContext = ReviewedContext.create();
		reviewedContext.setData(reviewed);

		reviewService.emit(reviewedContext);
	}
}
