using { sap.fe.cap.travel as my } from '../db/schema';

service AnalyticsService @(path:'/analytics') {

  // @(restrict: [
  //   { grant: 'READ', to: 'authenticated-user'},
  //   { grant: ['rejectTravel','acceptTravel','deductDiscount'], to: 'reviewer'},
  //   { grant: ['*'], to: 'processor'},
  //   { grant: ['*'], to: 'admin'}
  // ])
  entity Bookings as projection on my.Booking {
    @UI.Hidden: false
    BookingUUID as ID,
    to_Travel.TravelID || '-' || BookingID as rid : String,
    BookingDate,
    ConnectionID,
    FlightDate,
    @Measures.ISOCurrency: cuco
    FlightPrice          as price,
    CurrencyCode.code    as cuco,
    @Common.Text: statusName @Common.TextArrangement: #TextOnly
    //@Common.Text: null @Common.TextArrangement: null
    BookingStatus.code   as status,
    BookingStatus.name   as statusName,
    @Common.Text: airlineN
    to_Carrier.AirlineID as airline,
    to_Carrier.Name      as airlineN,
    // to_Flight.to_Connection.DepartureAirport.AirportID as departure,
    // to_Flight.to_Connection.DestinationAirport.AirportID as destination,
    // to_Flight.to_Connection.Distance
  };




}


// how to get prices right aligned?


