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

  TravelStatus_code : TravelStatusCode default 'O' @readonly;
  TravelStatus   : Association to TravelStatus on TravelStatus.code = TravelStatus_code;

  TravelStatus_ctrl: Int16 @odata.Type:'Edm.Byte' /*enum {Inapplicable = 0; ReadOnly = 1; Optional = 3; Mandatory = 7;}*/
    = (TravelStatus_code = 'A' ? 1 : 7 );

  to_Agency_AgencyID : String(6)  @mandatory;
  to_Agency      : Association to TravelAgency on to_Agency.AgencyID = to_Agency_AgencyID;
  to_Customer_CustomerID : String(6) @mandatory;
  to_Customer    : Association to Passenger on to_Customer.CustomerID = to_Customer_CustomerID;
  to_Booking     : Composition of many Booking on to_Booking.to_Travel = $self;

  field_A: String @label: 'controlled';
  field_Ctr : String @label: 'controlling';
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

  BookingStatus_code : BookingStatusCode  default 'N' @mandatory;
  BookingStatus     : Association to BookingStatus on BookingStatus.code = BookingStatus_code;
  to_BookSupplement : Composition of many BookingSupplement on to_BookSupplement.to_Booking = $self;

  to_Carrier_AirlineID : String(3) @mandatory;
  to_Carrier        : Association to Airline on to_Carrier.AirlineID = to_Carrier_AirlineID;
  to_Customer_CustomerID : String(6) @mandatory;
  to_Customer       : Association to Passenger on to_Customer.CustomerID = to_Customer_CustomerID;
  to_Travel_TravelUUID : UUID;
  to_Travel         : Association to Travel on to_Travel.TravelUUID = to_Travel_TravelUUID;

  to_Flight         : Association to Flight on  to_Flight.AirlineID = to_Carrier_AirlineID
                                            and to_Flight.FlightDate = FlightDate
                                            and to_Flight.ConnectionID = ConnectionID;
};

entity BookingSupplement : managed {
  key BookSupplUUID   : UUID;
  BookingSupplementID : Integer @Core.Computed;
  Price               : Decimal(16,3) @mandatory;
  CurrencyCode        : Currency;

  to_Booking_BookingUUID   : UUID;
  to_Booking          : Association to Booking on to_Booking.BookingUUID = to_Booking_BookingUUID;
  to_Travel_TravelUUID : UUID;
  to_Travel         : Association to Travel on to_Travel.TravelUUID = to_Travel_TravelUUID;
  to_Supplement_SupplementID : String(10) @mandatory;
  to_Supplement       : Association to Supplement on to_Supplement.SupplementID = to_Supplement_SupplementID;
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
