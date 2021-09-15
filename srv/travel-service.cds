using { sap.fe.cap.travel as my } from '../db/schema';

service TravelService @(path:'/processor') {

  @cds.redirection.target: false
  entity Travel2 as projection on my.Travel {
    *, to_Booking as Bookings { * }
    excluding { to_Flight, to_BookSupplement } // exposing unmanaged assocs not supported
  }

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
