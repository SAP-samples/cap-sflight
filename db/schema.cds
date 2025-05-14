using { Currency, custom.managed, sap.common.CodeList } from './common';
using { sap.fe.cap.travel as md } from './master-data';
namespace sap.fe.cap.travel;


entity Travel : managed {
  key TravelUUID : UUID;
  TravelID       : Integer default 0 @readonly;
  BeginDate      : Date;
  EndDate        : Date;
  BookingFee     : Decimal(16,3) default 0;
  TotalPrice     : Decimal(16,3) @readonly;
  CurrencyCode   : Currency default 'EUR';
  Description    : String(1024);
  TravelStatus   : Association to TravelStatus default 'O' @readonly;
  to_Agency      : Association to md.TravelAgency;
  to_Customer    : Association to md.Passenger;
  to_Booking     : Composition of many Booking on to_Booking.to_Travel = $self;
}


entity Booking : managed {
  key BookingUUID   : UUID;
  BookingID         : Integer @readonly;
  BookingDate       : Date;
  ConnectionID      : String(4);
  FlightDate        : Date;
  FlightPrice       : Decimal(16,3);
  CurrencyCode      : Currency;
  BookingStatus     : Association to BookingStatus default 'N';
  to_BookSupplement : Composition of many BookingSupplement on to_BookSupplement.to_Booking = $self;
  to_Travel         : Association to Travel;
  to_Carrier        : Association to md.Airline;
  to_Customer       : Association to md.Passenger;
  to_Flight         : Association to md.Flight on  to_Flight.AirlineID = to_Carrier.AirlineID
                                            and to_Flight.FlightDate = FlightDate
                                            and to_Flight.ConnectionID = ConnectionID;
}


entity BookingSupplement : managed {
  key BookSupplUUID   : UUID;
  BookingSupplementID : Integer @readonly;
  Price               : Decimal(16,3);
  CurrencyCode        : Currency;
  to_Booking          : Association to Booking;
  to_Travel           : Association to Travel;
  to_Supplement       : Association to md.Supplement;
}


//
//  Code Lists
//

entity BookingStatus : CodeList {
  key code : String(1) enum {
    New      = 'N';
    Booked   = 'B';
    Canceled = 'X';
  }
}

entity TravelStatus : CodeList {
  key code : String(1) enum {
    Open     = 'O';
    Accepted = 'A';
    Canceled = 'X';
  }
}


//
//  Green Washing
//

extend entity Travel with {
  GoGreen        : Boolean default false;
  GreenFee       : Decimal(16,3) @readonly;
  TreesPlanted   : Integer @readonly;
}
