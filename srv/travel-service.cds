using { sap.fe.cap.travel as my } from '../db/schema';


service TravelService @(path:'/processor', requires: 'admin') {

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
