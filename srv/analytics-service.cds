using { sap.fe.cap.travel as my } from '../db/schema';

service AnalyticsService @(path:'/analytics') {

  // @(restrict: [
  //   { grant: 'READ', to: 'authenticated-user'},
  // ])
  @readonly
  entity Bookings as projection on my.Booking {
    @UI.Hidden: false
    BookingUUID as ID,
    Travel.TravelID,
    BookingID,

    @title : 'Travel/Booking ID'
    Travel.TravelID || '/' || BookingID as CombinedID : String,


    ConnectionID,
    FlightDate,

    // pretend all bookings have the same currency so the FlightPrice can be aggregated
    @title: '{i18n>CurrencyCode}'
    'USD' as CurrencyCode_code : String(3),
    //CurrencyCode.code as CurrencyCode_code,
    @Measures.ISOCurrency: CurrencyCode_code
    FlightPrice,

    @title: '{i18n>BookingStatus}'
    @Common.Text: statusName @Common.TextArrangement: #TextOnly
    BookingStatus.code   as status,
    BookingStatus.name   as statusName,

    @Common.Text: airlineName
    Carrier.AirlineID as airline,
    Carrier.Name      as airlineName,

    BookingDate,

    Travel,
    Carrier,

    // Java has a problem with this association
    Flight,

    // Workaround:
    Flight.PlaneType,
    Flight.to_Connection.Distance,
    Flight.to_Connection.DistanceUnit,
    @Common.Label: '{i18n>DepartureAirport}'
    @Common.Text: DepCity
    Flight.to_Connection.DepartureAirport.AirportID as DepAirport,
    Flight.to_Connection.DepartureAirport.City      as DepCity,
    @Common.Label: '{i18n>ArrivalAirport}'
    @Common.Text: DestCity
    Flight.to_Connection.DestinationAirport.AirportID as DestAirport,
    Flight.to_Connection.DestinationAirport.City      as DestCity,


  };

  // for value help
  entity BookingStatus as projection on my.BookingStatus

  // for detail page:

  @readonly
  entity Travels as projection on my.Travel {
    *,
    @Common.Label: '{i18n>CustomerName}'
    Customer.FirstName || ' ' || Customer.LastName as CustomerName : String,
  };

  annotate Travels:TravelID with @Common.Text: null;

  annotate my.Airport:AirportID @Common.Text: City;
  annotate my.FlightConnection:Distance @(
    Common.Label: '{i18n>Distance}',
    Measures.Unit : DistanceUnit
  );
}
