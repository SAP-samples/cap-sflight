

using { sap.fe.cap.travel.review as my } from './schema';


service ReviewService @(path:'/reviewer') {

  entity TravelReview as projection on my.TravelReview;

  @topic: 'sap.cap.reviews.review.changed'
  event Reviewed : {
	subject : Integer;
	count : Integer;
	rating : Decimal;
  }
}