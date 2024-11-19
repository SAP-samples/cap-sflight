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
  BeginDate      : Date @mandatory;
  EndDate        : Date @mandatory;
  BookingFee     : Decimal(16,3) default 0;
  TotalPrice     : Decimal(16,3) @readonly;
  CurrencyCode   : Currency default 'EUR';
  Description    : String(1024);
  TravelStatus   : Association to TravelStatus default 'O' @readonly;
  to_Agency      : Association to TravelAgency @mandatory;
  to_Customer    : Association to Passenger @mandatory;
  to_Booking     : Composition of many Booking on to_Booking.to_Travel = $self;
};

annotate Travel with @Capabilities.FilterRestrictions.FilterExpressionRestrictions: [
  { Property: 'BeginDate', AllowedExpressions : 'SingleRange' },
  { Property: 'EndDate', AllowedExpressions : 'SingleRange' }
];


entity Booking : managed {
  key BookingUUID   : UUID;
  BookingID         : Integer @Core.Computed;
  BookingDate       : Date;
  ConnectionID      : String(4) @mandatory;
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
