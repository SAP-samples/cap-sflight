using { sap.fe.cap.travel as my } from '../db/schema';

type Percentage : Integer @assert.range: [1,100];

@requires: 'authenticated-user'
service TravelService @(path:'/processor') {

  entity Travel as projection on my.Travel actions {
    action createTravelByTemplate() returns Travel;
    action rejectTravel();
    action acceptTravel();
    action deductDiscount( percent: Percentage not null ) returns Travel;
  };
}



// @restrict annotations that you know and love!
annotate TravelService.Travel with @(restrict: [
  { grant: [ 'READ' ],                         to: 'authenticated-user' },
  { grant: [ 'WRITE', 'deductDiscount' ],      to: 'Planner' },
  { grant: [ 'rejectTravel', 'acceptTravel' ], to: 'Reviewer' }
]);








entity TravelService.User as projection on my.Empty {
  key $user.id as userId : String,
};

