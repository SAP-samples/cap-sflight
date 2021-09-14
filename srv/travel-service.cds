using { sap.fe.cap.travel as my } from '../db/schema';

service TravelService @(path:'/processor') {

  entity Travel_ as select from my.Travel {
    TravelUUID,
    TravelID,
    BeginDate,
    EndDate,
    BookingFee,
    TotalPrice,
    CurrencyCode,
    Description,
    TravelStatus,
    to_Agency,
    to_Customer,
    to_Booking
  };

  entity Travel__ as projection on Travel_ {
     TravelUUID,
    TravelID,
    BeginDate,
    EndDate,
    BookingFee,
    TotalPrice,
    CurrencyCode,
    Description,
    TravelStatus,
    to_Agency,
    to_Customer,
    to_Booking
  };

  entity Travel as projection on Travel__ actions {
    action createTravelByTemplate() returns Travel;
    action rejectTravel();
    action acceptTravel();
    action deductDiscount( percent: Percentage not null ) returns Travel;
  };

  // Ensure all masterdata entities are available to clients
  annotate my.MasterData with @cds.autoexpose @readonly;
}

type Percentage : Integer @assert.range: [1,100];
