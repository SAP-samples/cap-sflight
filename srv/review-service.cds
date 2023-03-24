
using { sap.fe.cap.travel as my } from '../db/schema';

service ReviewService @(path:'/processor') {

  entity TravelReview as projection on my.TravelReview;

  event Reviewed : {
	subject : Integer;
	count : Integer;
	rating : Decimal;
  }
}