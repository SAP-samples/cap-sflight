using { Currency, Country, custom.managed, sap } from './common';
namespace sap.fe.cap.travel;

// ensure all masterdata entities are available to clients
@cds.autoexpose @readonly
aspect MasterData {}

// Annotation @cds.collate: false will disable language-dependent ordering.
type AirlineId    : String(3) @cds.collate: false;
type ConnectionId : String(4) @cds.collate: false;

entity Airline : MasterData {
  key AirlineID : AirlineId;
  Name          : String(40);
  CurrencyCode  : Currency;
  AirlinePicURL : String      @UI : {IsImageURL : true};

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
  key AirlineID    : AirlineId;
  key FlightDate   : Date;
  key ConnectionID : ConnectionId;

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
  key ConnectionID   : ConnectionId;
  key AirlineID      : AirlineId;
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
  CountryCode    : Country;
  PhoneNumber    : String(30);
  EMailAddress   : String(256);
};

entity TravelAgency : MasterData {
  key AgencyID : String(6)   @cds.collate : false;
  Name         : String(80);
  Street       : String(60);
  PostalCode   : String(10);
  City         : String(40);
  CountryCode  : Country;
  PhoneNumber  : String(30);
  EMailAddress : String(256);
  WebAddress   : String(256);
};


//
// Code Lists
//

entity SupplementType : sap.common.CodeList {
  @cds.collate: false
  key code : String(2) enum {
    Beverage = 'BV';
    Meal     = 'ML';
    Luggage  = 'LU';
    Extra    = 'EX';
  };
}
