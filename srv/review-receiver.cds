service RemoteReviewService {

  @topic: 'sap.cap.reviews.review.changed'
  event Reviewed : {
	subject : Integer;
	count : Integer;
	rating : Decimal;
  }
}