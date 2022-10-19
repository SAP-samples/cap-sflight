using { sap.fe.cap.travel as my } from '../db/schema';

service AnalyticsService @(path:'/analytics') {

  // @(restrict: [
  //   { grant: 'READ', to: 'authenticated-user'},
  // ])

  entity Bookings as projection on my.Booking {
    @UI.Hidden: false
    BookingUUID as ID,
    @title : 'Travel/Booking ID'
    to_Travel.TravelID || '/' || BookingID as rid : String,
    BookingDate,
    ConnectionID,
    FlightDate,

    CurrencyCode.code as cuco,
    @Measures.ISOCurrency: cuco
    FlightPrice as price,

    @title: '{i18n>BookingStatus}'
    @Common.Text: statusName @Common.TextArrangement: #TextOnly
    BookingStatus.code   as status,
    BookingStatus.name   as statusName,

    @Common.Text: airlineN
    to_Carrier.AirlineID as airline,
    to_Carrier.Name      as airlineN,

    // to_Flight.to_Connection.DepartureAirport.AirportID as departure,
    // to_Flight.to_Connection.DestinationAirport.AirportID as destination,
    // to_Flight.to_Connection.Distance as dist,

    // to_Travel.TravelID as travelId,
    // to_Travel.Description as travelDescr,
    // to_Travel.to_Customer.LastName as travelLastName
  };




}

