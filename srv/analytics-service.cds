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
    to_Travel.TravelID || '/' || BookingID as rid : String,
    BookingDate,
    ConnectionID,
    FlightDate,


    //@Semantics.unitOfMeasure
    @Common.Label: 'QUnit'
    @Analytics.Measure: true
    @Aggregation.default: #MAX
    'kg' as QuantityUnit : String,

    @Common.Label: 'DecVal'
    @Analytics.Measure: true
    @Aggregation.default: #SUM
    @Measures.Unit : QuantityUnit
    4.4 as fieldWithUnit : Decimal(11,2),


    @Common.Label: 'Currency2'
    @Analytics.Measure: true
    @Aggregation.default: #MAX
    @Core.Computed: null
    @Semantics.currencyCode
    'EUR' as CurrCode : String,

    @Common.Label: 'Field w/ curr'
    @Analytics.Measure: true
    @Aggregation.default: #SUM
    @Measures.ISOCurrency : CurrCode
    @Core.Computed: null
    3.7 as fieldWithCurrency : Decimal(15,3),



    @Common.Label: 'Currency'
    @Analytics.Measure: true
    @Aggregation.default: #MAX
    //'EUR' as cuco : String,
    CurrencyCode.code as cuco : String,

    @Analytics.Measure: true
    @Aggregation.default: #SUM
    @Measures.ISOCurrency: cuco    // null
    FlightPrice          as price,


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

