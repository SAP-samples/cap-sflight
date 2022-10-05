using { sap.fe.cap.travel as my } from '../db/schema';

service AnalyticsService @(path:'/analytics') {

  // @(restrict: [
  //   { grant: 'READ', to: 'authenticated-user'},
  //   { grant: ['rejectTravel','acceptTravel','deductDiscount'], to: 'reviewer'},
  //   { grant: ['*'], to: 'processor'},
  //   { grant: ['*'], to: 'admin'}
  // ])
  entity Bookings as projection on my.Booking {
    BookingUUID as ID,
    BookingDate,
    ConnectionID,
    FlightDate,
    FlightPrice          as price,
    CurrencyCode         as cuco,
    BookingStatus.code   as status,
    to_Carrier.AirlineID as airline,
    // to_Flight.to_Connection.DepartureAirport.AirportID as departure,
    // to_Flight.to_Connection.DestinationAirport.AirportID as destination,
    // to_Flight.to_Connection.Distance
  };

}


