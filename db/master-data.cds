using { Currency, Country, custom.managed, sap } from './common';
namespace sap.fe.cap.travel;

// ensure all masterdata entities are available to clients
@cds.autoexpose @readonly
aspect MasterData {}

entity Airline : MasterData {
  key AirlineID : String(3) @cds.collate : false;
  Name          : String(40);
  CurrencyCode  : Currency;
  AirlinePicURL : String      @UI : {IsImageURL : true} @cds.collate: false;

};

entity Airport : MasterData {
  key AirportID : String(3) @cds.collate : false;
  Name          : String(40);
  City          : String(40);
  CountryCode   : Country;
};


entity Supplement : managed, MasterData {
  key SupplementID : String(10) @cds.collate : false;
  Price            : Decimal(16, 3);
  Type             : Association to SupplementType;
  Description      : localized String(1024);
  CurrencyCode     : Currency;
};

entity Flight : MasterData {
  // TODO:
  // when cuid is added, the to_Airline & to_Connection can be made managed association,
  // furthermore the AirlineID and ConnectionID can be removed,
  // they will be replaced by the generate FKs for to_Airline & to_Connection
  key AirlineID    : String(3) @cds.collate : false;
  key FlightDate   : Date;
  key ConnectionID : String(4) @cds.collate : false;

  Price            : Decimal(16, 3);
  CurrencyCode     : Currency;
  PlaneType        : String(10);
  MaximumSeats     : Integer;
  OccupiedSeats    : Integer;

  to_Airline       : Association to Airline on to_Airline.AirlineID = AirlineID;
  to_Connection    : Association to FlightConnection on to_Connection.AirlineID = AirlineID
                       and to_Connection.ConnectionID = ConnectionID;
};

entity FlightConnection : MasterData {
  // TODO:
  // once the TODO in Flight is done, similar change can be applied here
  // to_Airline can be managed association and AirlineID can be removed
  // and will be replaced with the generated FK
  key ConnectionID   : String(4) @cds.collate : false;
  key AirlineID      : String(3) @cds.collate : false;
  DepartureAirport   : Association to Airport;
  DestinationAirport : Association to Airport;
  DepartureTime      : Time;
  ArrivalTime        : Time;
  Distance           : Integer;
  DistanceUnit       : String(3);

  to_Airline         : Association to Airline
                         on to_Airline.AirlineID = AirlineID;
};

// showcasing unique constrains ??
// @assert.unique.email: [EMailAddress]
entity Passenger : managed, MasterData {
  key CustomerID : String(6)   @cds.collate : false;
  FirstName      : String(40);
  LastName       : String(40);
  Title          : String(10);
  Street         : String(60);
  PostalCode     : String(10);
  City           : String(40);
  CountryCode    : Country     @cds.collate : false;
  PhoneNumber    : String(30)  @cds.collate : false;
  EMailAddress   : String(256) @cds.collate : false;
};

entity TravelAgency : MasterData {
  key AgencyID : String(6)   @cds.collate : false;
  Name         : String(80);
  Street       : String(60);
  PostalCode   : String(10);
  City         : String(40);
  CountryCode  : Country     @cds.collate : false;
  PhoneNumber  : String(30)  @cds.collate : false;
  EMailAddress : String(256) @cds.collate : false;
  WebAddress   : String(256) @cds.collate : false;
};


//
// Code Lists
//

entity SupplementType : sap.common.CodeList {
  @cds.collate: false
  key code : String enum {
    Beverage = 'BV';
    Meal     = 'ML';
    Luggage  = 'LU';
    Extra    = 'EX';
  };
}
