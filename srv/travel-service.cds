using { sap.fe.cap.travel as my } from '../db/schema';

service TravelService @(path:'/processor') {

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

using { TravelFlow } from './travel-flow';
annotate TravelService.Travel with actions {
  createTravelByTemplate  @emits:  TravelFlow.Travel.new;
  rejectTravel            @emits:  TravelFlow.Travel.reject;
  acceptTravel            @emits:  TravelFlow.Travel.approve;
  NEW                     @emits:  TravelFlow.Travel.new;
  EDIT                    @emits:  TravelFlow.Travel.edit;
  SAVE                    @emits:  TravelFlow.Travel.save;
};
