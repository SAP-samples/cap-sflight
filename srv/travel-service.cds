using { sap.fe.cap.travel as my } from '../db/schema';

// Authorization:
//   authenticated-user: READ (no WRITE, no actions)
//   role reviewer: READ + actions reject/accept/deductDiscount
//   role processor: ALL


service TravelService @(path:'/processor'/*, requires: 'authenticated-user'*/) {

  @(restrict: [
    { grant: 'READ', to: 'authenticated-user'},
    { grant: ['rejectTravel','acceptTravel','deductDiscount'], to: 'reviewer'},
    { grant: ['*'], to: 'processor'},
    { grant: ['*'], to: 'admin'}
  ])
  entity Travel as projection on my.Travel actions {
    action createTravelByTemplate() returns Travel;
    action rejectTravel();
    action acceptTravel();
    action deductDiscount( percent: Percentage not null ) returns Travel;
  };

  // Ensure all masterdata entities are available to clients
  annotate my.MasterData with @cds.autoexpose @readonly;
}

type Percentage : Integer @assert.range: [1,100];
