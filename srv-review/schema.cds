using { Currency, custom.managed, sap.common.CodeList } from './common';

namespace sap.fe.cap.travel.review;

entity TravelReview : managed {
  key RatingUUID : UUID;
  TravelID : Integer;
  Rating : Integer @assert.range: [ 0, 5 ];
  Email : String;
  Comment : String;
}