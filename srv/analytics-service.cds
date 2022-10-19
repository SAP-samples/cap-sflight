using { sap.fe.cap.travel as my } from '../db/schema';

service AnalyticsService @(path:'/analytics') {

  // @(restrict: [
  //   { grant: 'READ', to: 'authenticated-user'},
  // ])
  @readonly
  entity Bookings as projection on my.Booking {
    @UI.Hidden: false
    BookingUUID as ID,
    @title : 'Travel/Booking ID'
    to_Travel.TravelID || '/' || BookingID as ReadableID : String,
    ConnectionID,
    FlightDate,

    CurrencyCode.code as cuco,
    @Measures.ISOCurrency: cuco
    FlightPrice as price,

    @title: '{i18n>BookingStatus}'
    @Common.Text: statusName @Common.TextArrangement: #TextOnly
    BookingStatus.code   as status,
    BookingStatus.name   as statusName,

    @Common.Text: airlineName
    to_Carrier.AirlineID as airline,
    to_Carrier.Name      as airlineName,

    BookingID,
    BookingDate,

    to_Travel,
    to_Flight,
    to_Carrier
  };


  // for detail page:

  @readonly
  entity Travels as projection on my.Travel {
    *,
    @Common.Label: 'Customer'
    to_Customer.FirstName || ' ' || to_Customer.LastName as CustomerName : String,
  };

  annotate Travels:TravelID with @Common.Text: null;

  annotate my.Airport:AirportID @Common.Text: City;
  annotate my.FlightConnection:Distance @(
    Common.Label: 'Distance',
    Measures.Unit : DistanceUnit
  );
}
