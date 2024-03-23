using { sap.fe.cap.travel as my } from '../db/schema';
using { sap.fe.cap.travel as masterdata} from '../db/master-data.cds';

service TravelService @(path:'/processor') {

  @readonly
  @cds.autoexpose
  entity Flight as projection on masterdata.Flight;

  event BookedSeatsOnFlight {
    ConnectionID : String(4);
    numberOfSeats : Integer;
  }

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

}

type Percentage : Integer @assert.range: [1,100];
