using { Currency, custom.managed, sap.common.CodeList } from './common';
using {
  sap.fe.cap.travel.Airline,
  sap.fe.cap.travel.Passenger,
  sap.fe.cap.travel.TravelAgency,
  sap.fe.cap.travel.Supplement,
  sap.fe.cap.travel.Flight
 } from './master-data';

namespace sap.fe.cap.travel;

entity Travel : managed {
  key TravelUUID : UUID;
  TravelID       : Integer default 0 @readonly;
  @assert.constraint.beginDateMustBeInFuture : {
      condition : (BeginDate > CURRENT_DATE),
      message: 'error.travel.date.past',
      parameters: [ (TravelID), (BeginDate) ]}
  BeginDate      : Date @mandatory;
  @assert.constraint.beginBeforeEndDate : {
    condition : (BeginDate <= EndDate),
    message: 'error.travel.date.before',
    parameters: [ (TravelID), (EndDate), (BeginDate) ]}
  EndDate        : Date @mandatory;

  @mandatory: (TravelStatus.code = 'A') // TODO does not show error on UI, yet
  BookingFee     : Decimal(16,3) default 0;

/*
  @assert.constraint.maxLimitForEur : {
    condition : ((CurrencyCode.code = 'EUR' and TotalPrice <= 10000) or CurrencyCode.code <> 'EUR')
  } // TODO could work but does not work because of @readonly and custom logic updating this element
  */
  TotalPrice     : Decimal(16,3) @readonly;
  CurrencyCode   : Currency default 'EUR';
  Description    : String(1024);
  TravelStatus   : Association to TravelStatus default 'O' @readonly;
  // TODO this results in a DB error as string and boolean are not comparable. Compiler could help here!
  //to_Agency      : Association to TravelAgency @mandatory : (Description);
  to_Agency      : Association to TravelAgency @mandatory;
  to_Customer    : Association to Passenger @mandatory;
  to_Booking     : Composition of many Booking on to_Booking.to_Travel = $self;
};

annotate Travel with @Capabilities.FilterRestrictions.FilterExpressionRestrictions: [
  { Property: 'BeginDate', AllowedExpressions : 'SingleRange' },
  { Property: 'EndDate', AllowedExpressions : 'SingleRange' }
];


/*
@assert.constraint.freeseats: {
  condition: (to_Flight.OccupiedSeats < to_Flight.MaximumSeats),
  message: 'no free seats on booked flight',
  target: [(to_Flight)]
} //TODO this does not yet work as expected. no error is thrown
*/
//TODO / IDEA entity level constraint validating customers from one country cannot travel to another country
entity Booking : managed {
  key BookingUUID   : UUID;
  BookingID         : Integer @Core.Computed;
  BookingDate       : Date;
  ConnectionID      : String(4) @mandatory;
  /*
  @assert.constraint.flightDate : {
      condition : (to_Travel.BeginDate <= FlightDate AND
                  FlightDate <= to_Travel.EndDate),
      message: 'error.booking.flightDateNotInTravelPeriod',
      parameters: [ (BookingID), (FlightDate), (to_Travel.BeginDate), (to_Travel.EndDate) ],
      targets: [(FlightDate)]}*/ // TODO test data does not match.
  FlightDate        : Date @mandatory;
  FlightPrice       : Decimal(16,3) @mandatory;
  CurrencyCode      : Currency;
  BookingStatus     : Association to BookingStatus default 'N' @mandatory;
  to_BookSupplement : Composition of many BookingSupplement on to_BookSupplement.to_Booking = $self;
  to_Carrier        : Association to Airline @mandatory;
  to_Customer       : Association to Passenger @mandatory;
  to_Travel         : Association to Travel;
  to_Flight         : Association to Flight on  to_Flight.AirlineID = to_Carrier.AirlineID
                                            and to_Flight.FlightDate = FlightDate
                                            and to_Flight.ConnectionID = ConnectionID;
};

entity BookingSupplement : managed {
  key BookSupplUUID   : UUID;
  BookingSupplementID : Integer @Core.Computed;
  Price               : Decimal(16,3) @mandatory;
  CurrencyCode        : Currency;
  to_Booking          : Association to Booking;
  to_Travel           : Association to Travel;
  to_Supplement       : Association to Supplement @mandatory;
};


//
//  Code Lists
//

type BookingStatusCode : String(1) enum {
  New      = 'N';
  Booked   = 'B';
  Canceled = 'X';
};

entity BookingStatus : CodeList {
  key code : BookingStatusCode
};

type TravelStatusCode : String(1) enum {
  Open     = 'O';
  Accepted = 'A';
  Canceled = 'X';
};

entity TravelStatus : CodeList {
  key code : TravelStatusCode;
  // can't use UInt8 (which would automatically be mapped to Edm.Byte) because it's not supported on H2
  fieldControl: Int16 @odata.Type:'Edm.Byte' enum {
    Inapplicable = 0;
    ReadOnly = 1;
    Optional = 3;
    Mandatory = 7;
  };
  createDeleteHidden: Boolean;
  insertDeleteRestriction: Boolean; // = NOT createDeleteHidden
}

extend entity Travel with {
  GoGreen        : Boolean default false;
  GreenFee       : Decimal(16, 3) @Core.Computed @readonly;
  TreesPlanted   : Integer @Core.Computed @readonly;  
};
