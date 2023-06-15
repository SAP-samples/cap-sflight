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
  TravelID       : Integer @readonly default 0;
  BeginDate      : Date;
  EndDate        : Date;
  BookingFee     : Decimal(16, 3);
  TotalPrice     : Decimal(16, 3) @readonly;
  CurrencyCode   : Currency;
  Description    : String(1024);
  TravelStatus   : Association to TravelStatus @readonly;
  Agency         : Association to TravelAgency;
  Customer       : Association to Passenger;
  Bookings       : Composition of many Booking on Bookings.Travel = $self;
};

annotate Travel with @(
 Capabilities: {
        FilterRestrictions     : {FilterExpressionRestrictions : [{
            Property           : 'BeginDate',
            AllowedExpressions : 'SingleRange'
        },
        {
            Property           : 'EndDate',
            AllowedExpressions : 'SingleRange'
        }]}
    });


entity Booking : managed {
  key BookingUUID   : UUID;
  BookingID         : Integer @Core.Computed;
  BookingDate       : Date;
  ConnectionID      : String(4);
  FlightDate        : Date;
  FlightPrice       : Decimal(16, 3);
  CurrencyCode      : Currency;
  BookingStatus     : Association to BookingStatus;
  BookSupplements   : Composition of many BookingSupplement on BookSupplements.Booking = $self;
  Carrier           : Association to Airline;
  Customer          : Association to Passenger;
  Travel            : Association to Travel;
  Flight            : Association to Flight on  Flight.AirlineID = Carrier.AirlineID
                                            and Flight.FlightDate = FlightDate
                                            and Flight.ConnectionID = ConnectionID;
};

entity BookingSupplement : managed {
  key BookSupplUUID   : UUID;
  BookingSupplementID : Integer @Core.Computed;
  Price               : Decimal(16, 3);
  CurrencyCode        : Currency;
  Booking             : Association to Booking;
  Travel              : Association to Travel;
  Supplement          : Association to Supplement;
};


//
//  Code Lists
//

entity BookingStatus : CodeList {
  key code : String enum {
    New      = 'N';
    Booked   = 'B';
    Canceled = 'X';
  };
};

entity TravelStatus : CodeList {
  key code : String enum {
    Open     = 'O';
    Accepted = 'A';
    Canceled = 'X';
  } default 'O'; //> will be used for foreign keys as well
  fieldControl: Integer @odata.Type:'Edm.Byte'; // 1: #ReadOnly, 7: #Mandatory
  createDeleteHidden: Boolean;
  insertDeleteRestriction: Boolean; // = NOT createDeleteHidden
}
