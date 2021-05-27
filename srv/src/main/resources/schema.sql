DROP VIEW IF EXISTS TravelService_Airline;
DROP VIEW IF EXISTS TravelService_Airport;
DROP VIEW IF EXISTS TravelService_Booking;
DROP VIEW IF EXISTS TravelService_BookingStatus;
DROP VIEW IF EXISTS TravelService_BookingStatus_texts;
DROP VIEW IF EXISTS TravelService_BookingSupplement;
DROP VIEW IF EXISTS TravelService_Countries;
DROP VIEW IF EXISTS TravelService_Countries_texts;
DROP VIEW IF EXISTS TravelService_Currencies;
DROP VIEW IF EXISTS TravelService_Currencies_texts;
DROP VIEW IF EXISTS TravelService_Flight;
DROP VIEW IF EXISTS TravelService_FlightConnection;
DROP VIEW IF EXISTS TravelService_Passenger;
DROP VIEW IF EXISTS TravelService_Supplement;
DROP VIEW IF EXISTS TravelService_Supplement_texts;
DROP VIEW IF EXISTS TravelService_SupplementType;
DROP VIEW IF EXISTS TravelService_SupplementType_texts;
DROP VIEW IF EXISTS TravelService_Travel;
DROP VIEW IF EXISTS TravelService_TravelAgency;
DROP VIEW IF EXISTS TravelService_TravelStatus;
DROP VIEW IF EXISTS TravelService_TravelStatus_texts;
DROP VIEW IF EXISTS localized_sap_common_Countries;
DROP VIEW IF EXISTS localized_sap_common_Currencies;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_BookingStatus;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_Supplement;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_SupplementType;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_TravelStatus;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_Airline;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_Airport;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_Booking;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_BookingSupplement;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_Flight;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_Passenger;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_Travel;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_TravelAgency;
DROP VIEW IF EXISTS localized_sap_fe_cap_travel_FlightConnection;
DROP VIEW IF EXISTS TravelService_DraftAdministrativeData;
DROP VIEW IF EXISTS localized_TravelService_BookingStatus;
DROP VIEW IF EXISTS localized_TravelService_Countries;
DROP VIEW IF EXISTS localized_TravelService_Currencies;
DROP VIEW IF EXISTS localized_TravelService_Supplement;
DROP VIEW IF EXISTS localized_TravelService_SupplementType;
DROP VIEW IF EXISTS localized_TravelService_TravelStatus;
DROP VIEW IF EXISTS localized_TravelService_Booking;
DROP VIEW IF EXISTS localized_TravelService_Airport;
DROP VIEW IF EXISTS localized_TravelService_Passenger;
DROP VIEW IF EXISTS localized_TravelService_TravelAgency;
DROP VIEW IF EXISTS localized_TravelService_Airline;
DROP VIEW IF EXISTS localized_TravelService_BookingSupplement;
DROP VIEW IF EXISTS localized_TravelService_Flight;
DROP VIEW IF EXISTS localized_TravelService_Travel;
DROP VIEW IF EXISTS localized_TravelService_FlightConnection;
DROP VIEW IF EXISTS localized_de_sap_common_Countries;
DROP VIEW IF EXISTS localized_fr_sap_common_Countries;
DROP VIEW IF EXISTS localized_de_sap_common_Currencies;
DROP VIEW IF EXISTS localized_fr_sap_common_Currencies;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_BookingStatus;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_BookingStatus;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_Supplement;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_Supplement;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_SupplementType;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_SupplementType;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_TravelStatus;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_TravelStatus;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_Airline;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_Airline;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_Airport;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_Airport;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_Booking;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_Booking;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_BookingSupplement;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_BookingSupplement;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_Flight;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_Flight;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_Passenger;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_Passenger;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_Travel;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_Travel;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_TravelAgency;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_TravelAgency;
DROP VIEW IF EXISTS localized_de_sap_fe_cap_travel_FlightConnection;
DROP VIEW IF EXISTS localized_fr_sap_fe_cap_travel_FlightConnection;
DROP VIEW IF EXISTS localized_de_TravelService_BookingStatus;
DROP VIEW IF EXISTS localized_fr_TravelService_BookingStatus;
DROP VIEW IF EXISTS localized_de_TravelService_Countries;
DROP VIEW IF EXISTS localized_fr_TravelService_Countries;
DROP VIEW IF EXISTS localized_de_TravelService_Currencies;
DROP VIEW IF EXISTS localized_fr_TravelService_Currencies;
DROP VIEW IF EXISTS localized_de_TravelService_Supplement;
DROP VIEW IF EXISTS localized_fr_TravelService_Supplement;
DROP VIEW IF EXISTS localized_de_TravelService_SupplementType;
DROP VIEW IF EXISTS localized_fr_TravelService_SupplementType;
DROP VIEW IF EXISTS localized_de_TravelService_TravelStatus;
DROP VIEW IF EXISTS localized_fr_TravelService_TravelStatus;
DROP VIEW IF EXISTS localized_de_TravelService_Booking;
DROP VIEW IF EXISTS localized_fr_TravelService_Booking;
DROP VIEW IF EXISTS localized_de_TravelService_Airport;
DROP VIEW IF EXISTS localized_fr_TravelService_Airport;
DROP VIEW IF EXISTS localized_de_TravelService_Passenger;
DROP VIEW IF EXISTS localized_fr_TravelService_Passenger;
DROP VIEW IF EXISTS localized_de_TravelService_TravelAgency;
DROP VIEW IF EXISTS localized_fr_TravelService_TravelAgency;
DROP VIEW IF EXISTS localized_de_TravelService_Airline;
DROP VIEW IF EXISTS localized_fr_TravelService_Airline;
DROP VIEW IF EXISTS localized_de_TravelService_BookingSupplement;
DROP VIEW IF EXISTS localized_fr_TravelService_BookingSupplement;
DROP VIEW IF EXISTS localized_de_TravelService_Flight;
DROP VIEW IF EXISTS localized_fr_TravelService_Flight;
DROP VIEW IF EXISTS localized_de_TravelService_Travel;
DROP VIEW IF EXISTS localized_fr_TravelService_Travel;
DROP VIEW IF EXISTS localized_de_TravelService_FlightConnection;
DROP VIEW IF EXISTS localized_fr_TravelService_FlightConnection;

DROP TABLE IF EXISTS sap_common_Countries;
DROP TABLE IF EXISTS sap_common_Countries_texts;
DROP TABLE IF EXISTS sap_common_Currencies;
DROP TABLE IF EXISTS sap_common_Currencies_texts;
DROP TABLE IF EXISTS sap_fe_cap_travel_Airline;
DROP TABLE IF EXISTS sap_fe_cap_travel_Airport;
DROP TABLE IF EXISTS sap_fe_cap_travel_Booking;
DROP TABLE IF EXISTS sap_fe_cap_travel_BookingStatus;
DROP TABLE IF EXISTS sap_fe_cap_travel_BookingStatus_texts;
DROP TABLE IF EXISTS sap_fe_cap_travel_BookingSupplement;
DROP TABLE IF EXISTS sap_fe_cap_travel_Flight;
DROP TABLE IF EXISTS sap_fe_cap_travel_FlightConnection;
DROP TABLE IF EXISTS sap_fe_cap_travel_Passenger;
DROP TABLE IF EXISTS sap_fe_cap_travel_Supplement;
DROP TABLE IF EXISTS sap_fe_cap_travel_Supplement_texts;
DROP TABLE IF EXISTS sap_fe_cap_travel_SupplementType;
DROP TABLE IF EXISTS sap_fe_cap_travel_SupplementType_texts;
DROP TABLE IF EXISTS sap_fe_cap_travel_Travel;
DROP TABLE IF EXISTS sap_fe_cap_travel_TravelAgency;
DROP TABLE IF EXISTS sap_fe_cap_travel_TravelStatus;
DROP TABLE IF EXISTS sap_fe_cap_travel_TravelStatus_texts;
DROP TABLE IF EXISTS DRAFT_DraftAdministrativeData;
DROP TABLE IF EXISTS TravelService_Travel_drafts;
DROP TABLE IF EXISTS TravelService_Booking_drafts;
DROP TABLE IF EXISTS TravelService_BookingSupplement_drafts;

CREATE TABLE sap_common_Countries (
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(3) NOT NULL,
  PRIMARY KEY(code)
);

CREATE TABLE sap_common_Countries_texts (
  locale NVARCHAR(14) NOT NULL,
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(3) NOT NULL,
  PRIMARY KEY(locale, code)
);

CREATE TABLE sap_common_Currencies (
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(3) NOT NULL,
  symbol NVARCHAR(5),
  numcode INTEGER,
  exponent INTEGER,
  minor NVARCHAR(5000),
  PRIMARY KEY(code)
);

CREATE TABLE sap_common_Currencies_texts (
  locale NVARCHAR(14) NOT NULL,
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(3) NOT NULL,
  PRIMARY KEY(locale, code)
);

CREATE TABLE sap_fe_cap_travel_Airline (
  AirlineID NVARCHAR(3) NOT NULL,
  Name NVARCHAR(40),
  CurrencyCode_code NVARCHAR(3),
  PRIMARY KEY(AirlineID)
);

CREATE TABLE sap_fe_cap_travel_Airport (
  AirportID NVARCHAR(3) NOT NULL,
  Name NVARCHAR(40),
  City NVARCHAR(40),
  CountryCode_code NVARCHAR(3),
  PRIMARY KEY(AirportID)
);

CREATE TABLE sap_fe_cap_travel_Booking (
  createdAt TIMESTAMP_TEXT,
  createdBy NVARCHAR(255),
  LastChangedAt TIMESTAMP_TEXT,
  LastChangedBy NVARCHAR(255),
  BookingUUID NVARCHAR(36) NOT NULL,
  BookingID INTEGER,
  BookingDate DATE_TEXT,
  ConnectionID NVARCHAR(4),
  FlightDate DATE_TEXT,
  FlightPrice DECIMAL(16, 3),
  CurrencyCode_code NVARCHAR(3),
  BookingStatus_code NVARCHAR(5000),
  to_Carrier_AirlineID NVARCHAR(3),
  to_Customer_CustomerID NVARCHAR(6),
  to_Travel_TravelUUID NVARCHAR(36),
  PRIMARY KEY(BookingUUID)
);

CREATE TABLE sap_fe_cap_travel_BookingStatus (
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(5000) NOT NULL,
  PRIMARY KEY(code)
);

CREATE TABLE sap_fe_cap_travel_BookingStatus_texts (
  locale NVARCHAR(14) NOT NULL,
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(5000) NOT NULL,
  PRIMARY KEY(locale, code)
);

CREATE TABLE sap_fe_cap_travel_BookingSupplement (
  createdAt TIMESTAMP_TEXT,
  createdBy NVARCHAR(255),
  LastChangedAt TIMESTAMP_TEXT,
  LastChangedBy NVARCHAR(255),
  BookSupplUUID NVARCHAR(36) NOT NULL,
  BookingSupplementID INTEGER,
  Price DECIMAL(16, 3),
  CurrencyCode_code NVARCHAR(3),
  to_Booking_BookingUUID NVARCHAR(36),
  to_Travel_TravelUUID NVARCHAR(36),
  to_Supplement_SupplementID NVARCHAR(10),
  PRIMARY KEY(BookSupplUUID)
);

CREATE TABLE sap_fe_cap_travel_Flight (
  AirlineID NVARCHAR(3) NOT NULL,
  FlightDate DATE_TEXT NOT NULL,
  ConnectionID NVARCHAR(4) NOT NULL,
  Price DECIMAL(16, 3),
  CurrencyCode_code NVARCHAR(3),
  PlaneType NVARCHAR(10),
  MaximumSeats INTEGER,
  OccupiedSeats INTEGER,
  PRIMARY KEY(AirlineID, FlightDate, ConnectionID)
);

CREATE TABLE sap_fe_cap_travel_FlightConnection (
  ConnectionID NVARCHAR(4) NOT NULL,
  AirlineID NVARCHAR(3) NOT NULL,
  DepartureAirport_AirportID NVARCHAR(3),
  DestinationAirport_AirportID NVARCHAR(3),
  DepartureTime TIME_TEXT,
  ArrivalTime TIME_TEXT,
  Distance INTEGER,
  DistanceUnit NVARCHAR(3),
  PRIMARY KEY(ConnectionID, AirlineID)
);

CREATE TABLE sap_fe_cap_travel_Passenger (
  createdAt TIMESTAMP_TEXT,
  createdBy NVARCHAR(255),
  LastChangedAt TIMESTAMP_TEXT,
  LastChangedBy NVARCHAR(255),
  CustomerID NVARCHAR(6) NOT NULL,
  FirstName NVARCHAR(40),
  LastName NVARCHAR(40),
  Title NVARCHAR(10),
  Street NVARCHAR(60),
  PostalCode NVARCHAR(10),
  City NVARCHAR(40),
  CountryCode_code NVARCHAR(3),
  PhoneNumber NVARCHAR(30),
  EMailAddress NVARCHAR(256),
  PRIMARY KEY(CustomerID)
);

CREATE TABLE sap_fe_cap_travel_Supplement (
  createdAt TIMESTAMP_TEXT,
  createdBy NVARCHAR(255),
  LastChangedAt TIMESTAMP_TEXT,
  LastChangedBy NVARCHAR(255),
  SupplementID NVARCHAR(10) NOT NULL,
  Price DECIMAL(16, 3),
  Type_code NVARCHAR(5000),
  Description NVARCHAR(1024),
  CurrencyCode_code NVARCHAR(3),
  PRIMARY KEY(SupplementID)
);

CREATE TABLE sap_fe_cap_travel_Supplement_texts (
  locale NVARCHAR(14) NOT NULL,
  SupplementID NVARCHAR(10) NOT NULL,
  Description NVARCHAR(1024),
  PRIMARY KEY(locale, SupplementID)
);

CREATE TABLE sap_fe_cap_travel_SupplementType (
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(5000) NOT NULL,
  PRIMARY KEY(code)
);

CREATE TABLE sap_fe_cap_travel_SupplementType_texts (
  locale NVARCHAR(14) NOT NULL,
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(5000) NOT NULL,
  PRIMARY KEY(locale, code)
);

CREATE TABLE sap_fe_cap_travel_Travel (
  createdAt TIMESTAMP_TEXT,
  createdBy NVARCHAR(255),
  LastChangedAt TIMESTAMP_TEXT,
  LastChangedBy NVARCHAR(255),
  TravelUUID NVARCHAR(36) NOT NULL,
  TravelID INTEGER DEFAULT 0,
  BeginDate DATE_TEXT,
  EndDate DATE_TEXT,
  BookingFee DECIMAL(16, 3),
  TotalPrice DECIMAL(16, 3),
  CurrencyCode_code NVARCHAR(3),
  Description NVARCHAR(1024),
  TravelStatus_code NVARCHAR(5000) DEFAULT 'O',
  to_Agency_AgencyID NVARCHAR(6),
  to_Customer_CustomerID NVARCHAR(6),
  PRIMARY KEY(TravelUUID)
);

CREATE TABLE sap_fe_cap_travel_TravelAgency (
  AgencyID NVARCHAR(6) NOT NULL,
  Name NVARCHAR(80),
  Street NVARCHAR(60),
  PostalCode NVARCHAR(10),
  City NVARCHAR(40),
  CountryCode_code NVARCHAR(3),
  PhoneNumber NVARCHAR(30),
  EMailAddress NVARCHAR(256),
  WebAddress NVARCHAR(256),
  PRIMARY KEY(AgencyID)
);

CREATE TABLE sap_fe_cap_travel_TravelStatus (
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(5000) NOT NULL DEFAULT 'O',
  PRIMARY KEY(code)
);

CREATE TABLE sap_fe_cap_travel_TravelStatus_texts (
  locale NVARCHAR(14) NOT NULL,
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(5000) NOT NULL DEFAULT 'O',
  PRIMARY KEY(locale, code)
);

CREATE TABLE DRAFT_DraftAdministrativeData (
  DraftUUID NVARCHAR(36) NOT NULL,
  CreationDateTime TIMESTAMP_TEXT,
  CreatedByUser NVARCHAR(256),
  DraftIsCreatedByMe BOOLEAN,
  LastChangeDateTime TIMESTAMP_TEXT,
  LastChangedByUser NVARCHAR(256),
  InProcessByUser NVARCHAR(256),
  DraftIsProcessedByMe BOOLEAN,
  PRIMARY KEY(DraftUUID)
);

CREATE TABLE TravelService_Travel_drafts (
  createdAt TIMESTAMP_TEXT NULL,
  createdBy NVARCHAR(255) NULL,
  LastChangedAt TIMESTAMP_TEXT NULL,
  LastChangedBy NVARCHAR(255) NULL,
  TravelUUID NVARCHAR(36) NOT NULL,
  TravelID INTEGER NULL DEFAULT 0,
  BeginDate DATE_TEXT NULL,
  EndDate DATE_TEXT NULL,
  BookingFee DECIMAL(16, 3) NULL,
  TotalPrice DECIMAL(16, 3) NULL,
  CurrencyCode_code NVARCHAR(3) NULL,
  Description NVARCHAR(1024) NULL,
  TravelStatus_code NVARCHAR(5000) NULL DEFAULT 'O',
  to_Agency_AgencyID NVARCHAR(6) NULL,
  to_Customer_CustomerID NVARCHAR(6) NULL,
  IsActiveEntity BOOLEAN,
  HasActiveEntity BOOLEAN,
  HasDraftEntity BOOLEAN,
  DraftAdministrativeData_DraftUUID NVARCHAR(36) NOT NULL,
  PRIMARY KEY(TravelUUID)
);

CREATE TABLE TravelService_Booking_drafts (
  createdAt TIMESTAMP_TEXT NULL,
  createdBy NVARCHAR(255) NULL,
  LastChangedAt TIMESTAMP_TEXT NULL,
  LastChangedBy NVARCHAR(255) NULL,
  BookingUUID NVARCHAR(36) NOT NULL,
  BookingID INTEGER NULL,
  BookingDate DATE_TEXT NULL,
  ConnectionID NVARCHAR(4) NULL,
  FlightDate DATE_TEXT NULL,
  FlightPrice DECIMAL(16, 3) NULL,
  CurrencyCode_code NVARCHAR(3) NULL,
  BookingStatus_code NVARCHAR(5000) NULL,
  to_Carrier_AirlineID NVARCHAR(3) NULL,
  to_Customer_CustomerID NVARCHAR(6) NULL,
  to_Travel_TravelUUID NVARCHAR(36) NULL,
  IsActiveEntity BOOLEAN,
  HasActiveEntity BOOLEAN,
  HasDraftEntity BOOLEAN,
  DraftAdministrativeData_DraftUUID NVARCHAR(36) NOT NULL,
  PRIMARY KEY(BookingUUID)
);

CREATE TABLE TravelService_BookingSupplement_drafts (
  createdAt TIMESTAMP_TEXT NULL,
  createdBy NVARCHAR(255) NULL,
  LastChangedAt TIMESTAMP_TEXT NULL,
  LastChangedBy NVARCHAR(255) NULL,
  BookSupplUUID NVARCHAR(36) NOT NULL,
  BookingSupplementID INTEGER NULL,
  Price DECIMAL(16, 3) NULL,
  CurrencyCode_code NVARCHAR(3) NULL,
  to_Booking_BookingUUID NVARCHAR(36) NULL,
  to_Travel_TravelUUID NVARCHAR(36) NULL,
  to_Supplement_SupplementID NVARCHAR(10) NULL,
  IsActiveEntity BOOLEAN,
  HasActiveEntity BOOLEAN,
  HasDraftEntity BOOLEAN,
  DraftAdministrativeData_DraftUUID NVARCHAR(36) NOT NULL,
  PRIMARY KEY(BookSupplUUID)
);

CREATE VIEW TravelService_Airline AS SELECT
  Airline_0.AirlineID,
  Airline_0.Name,
  Airline_0.CurrencyCode_code
FROM sap_fe_cap_travel_Airline AS Airline_0;

CREATE VIEW TravelService_Airport AS SELECT
  Airport_0.AirportID,
  Airport_0.Name,
  Airport_0.City,
  Airport_0.CountryCode_code
FROM sap_fe_cap_travel_Airport AS Airport_0;

CREATE VIEW TravelService_Booking AS SELECT
  Booking_0.createdAt,
  Booking_0.createdBy,
  Booking_0.LastChangedAt,
  Booking_0.LastChangedBy,
  Booking_0.BookingUUID,
  Booking_0.BookingID,
  Booking_0.BookingDate,
  Booking_0.ConnectionID,
  Booking_0.FlightDate,
  Booking_0.FlightPrice,
  Booking_0.CurrencyCode_code,
  Booking_0.BookingStatus_code,
  Booking_0.to_Carrier_AirlineID,
  Booking_0.to_Customer_CustomerID,
  Booking_0.to_Travel_TravelUUID
FROM sap_fe_cap_travel_Booking AS Booking_0;

CREATE VIEW TravelService_BookingStatus AS SELECT
  BookingStatus_0.name,
  BookingStatus_0.descr,
  BookingStatus_0.code
FROM sap_fe_cap_travel_BookingStatus AS BookingStatus_0;

CREATE VIEW TravelService_BookingStatus_texts AS SELECT
  texts_0.locale,
  texts_0.name,
  texts_0.descr,
  texts_0.code
FROM sap_fe_cap_travel_BookingStatus_texts AS texts_0;

CREATE VIEW TravelService_BookingSupplement AS SELECT
  BookingSupplement_0.createdAt,
  BookingSupplement_0.createdBy,
  BookingSupplement_0.LastChangedAt,
  BookingSupplement_0.LastChangedBy,
  BookingSupplement_0.BookSupplUUID,
  BookingSupplement_0.BookingSupplementID,
  BookingSupplement_0.Price,
  BookingSupplement_0.CurrencyCode_code,
  BookingSupplement_0.to_Booking_BookingUUID,
  BookingSupplement_0.to_Travel_TravelUUID,
  BookingSupplement_0.to_Supplement_SupplementID
FROM sap_fe_cap_travel_BookingSupplement AS BookingSupplement_0;

CREATE VIEW TravelService_Countries AS SELECT
  Countries_0.name,
  Countries_0.descr,
  Countries_0.code
FROM sap_common_Countries AS Countries_0;

CREATE VIEW TravelService_Countries_texts AS SELECT
  texts_0.locale,
  texts_0.name,
  texts_0.descr,
  texts_0.code
FROM sap_common_Countries_texts AS texts_0;

CREATE VIEW TravelService_Currencies AS SELECT
  Currencies_0.name,
  Currencies_0.descr,
  Currencies_0.code,
  Currencies_0.symbol,
  Currencies_0.numcode,
  Currencies_0.exponent,
  Currencies_0.minor
FROM sap_common_Currencies AS Currencies_0;

CREATE VIEW TravelService_Currencies_texts AS SELECT
  texts_0.locale,
  texts_0.name,
  texts_0.descr,
  texts_0.code
FROM sap_common_Currencies_texts AS texts_0;

CREATE VIEW TravelService_Flight AS SELECT
  Flight_0.AirlineID,
  Flight_0.FlightDate,
  Flight_0.ConnectionID,
  Flight_0.Price,
  Flight_0.CurrencyCode_code,
  Flight_0.PlaneType,
  Flight_0.MaximumSeats,
  Flight_0.OccupiedSeats
FROM sap_fe_cap_travel_Flight AS Flight_0;

CREATE VIEW TravelService_FlightConnection AS SELECT
  FlightConnection_0.ConnectionID,
  FlightConnection_0.AirlineID,
  FlightConnection_0.DepartureAirport_AirportID,
  FlightConnection_0.DestinationAirport_AirportID,
  FlightConnection_0.DepartureTime,
  FlightConnection_0.ArrivalTime,
  FlightConnection_0.Distance,
  FlightConnection_0.DistanceUnit
FROM sap_fe_cap_travel_FlightConnection AS FlightConnection_0;

CREATE VIEW TravelService_Passenger AS SELECT
  Passenger_0.createdAt,
  Passenger_0.createdBy,
  Passenger_0.LastChangedAt,
  Passenger_0.LastChangedBy,
  Passenger_0.CustomerID,
  Passenger_0.FirstName,
  Passenger_0.LastName,
  Passenger_0.Title,
  Passenger_0.Street,
  Passenger_0.PostalCode,
  Passenger_0.City,
  Passenger_0.CountryCode_code,
  Passenger_0.PhoneNumber,
  Passenger_0.EMailAddress
FROM sap_fe_cap_travel_Passenger AS Passenger_0;

CREATE VIEW TravelService_Supplement AS SELECT
  Supplement_0.createdAt,
  Supplement_0.createdBy,
  Supplement_0.LastChangedAt,
  Supplement_0.LastChangedBy,
  Supplement_0.SupplementID,
  Supplement_0.Price,
  Supplement_0.Type_code,
  Supplement_0.Description,
  Supplement_0.CurrencyCode_code
FROM sap_fe_cap_travel_Supplement AS Supplement_0;

CREATE VIEW TravelService_Supplement_texts AS SELECT
  texts_0.locale,
  texts_0.SupplementID,
  texts_0.Description
FROM sap_fe_cap_travel_Supplement_texts AS texts_0;

CREATE VIEW TravelService_SupplementType AS SELECT
  SupplementType_0.name,
  SupplementType_0.descr,
  SupplementType_0.code
FROM sap_fe_cap_travel_SupplementType AS SupplementType_0;

CREATE VIEW TravelService_SupplementType_texts AS SELECT
  texts_0.locale,
  texts_0.name,
  texts_0.descr,
  texts_0.code
FROM sap_fe_cap_travel_SupplementType_texts AS texts_0;

CREATE VIEW TravelService_Travel AS SELECT
  Travel_0.createdAt,
  Travel_0.createdBy,
  Travel_0.LastChangedAt,
  Travel_0.LastChangedBy,
  Travel_0.TravelUUID,
  Travel_0.TravelID,
  Travel_0.BeginDate,
  Travel_0.EndDate,
  Travel_0.BookingFee,
  Travel_0.TotalPrice,
  Travel_0.CurrencyCode_code,
  Travel_0.Description,
  Travel_0.TravelStatus_code,
  Travel_0.to_Agency_AgencyID,
  Travel_0.to_Customer_CustomerID
FROM sap_fe_cap_travel_Travel AS Travel_0;

CREATE VIEW TravelService_TravelAgency AS SELECT
  TravelAgency_0.AgencyID,
  TravelAgency_0.Name,
  TravelAgency_0.Street,
  TravelAgency_0.PostalCode,
  TravelAgency_0.City,
  TravelAgency_0.CountryCode_code,
  TravelAgency_0.PhoneNumber,
  TravelAgency_0.EMailAddress,
  TravelAgency_0.WebAddress
FROM sap_fe_cap_travel_TravelAgency AS TravelAgency_0;

CREATE VIEW TravelService_TravelStatus AS SELECT
  TravelStatus_0.name,
  TravelStatus_0.descr,
  TravelStatus_0.code
FROM sap_fe_cap_travel_TravelStatus AS TravelStatus_0;

CREATE VIEW TravelService_TravelStatus_texts AS SELECT
  texts_0.locale,
  texts_0.name,
  texts_0.descr,
  texts_0.code
FROM sap_fe_cap_travel_TravelStatus_texts AS texts_0;

CREATE VIEW localized_sap_common_Countries AS SELECT
  coalesce(localized_1.name, L_0.name) AS name,
  coalesce(localized_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_common_Countries AS L_0 LEFT JOIN sap_common_Countries_texts AS localized_1 ON localized_1.code = L_0.code AND localized_1.locale = 'en');

CREATE VIEW localized_sap_common_Currencies AS SELECT
  coalesce(localized_1.name, L_0.name) AS name,
  coalesce(localized_1.descr, L_0.descr) AS descr,
  L_0.code,
  L_0.symbol,
  L_0.numcode,
  L_0.exponent,
  L_0.minor
FROM (sap_common_Currencies AS L_0 LEFT JOIN sap_common_Currencies_texts AS localized_1 ON localized_1.code = L_0.code AND localized_1.locale = 'en');

CREATE VIEW localized_sap_fe_cap_travel_BookingStatus AS SELECT
  coalesce(localized_1.name, L_0.name) AS name,
  coalesce(localized_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_fe_cap_travel_BookingStatus AS L_0 LEFT JOIN sap_fe_cap_travel_BookingStatus_texts AS localized_1 ON localized_1.code = L_0.code AND localized_1.locale = 'en');

CREATE VIEW localized_sap_fe_cap_travel_Supplement AS SELECT
  L_0.createdAt,
  L_0.createdBy,
  L_0.LastChangedAt,
  L_0.LastChangedBy,
  L_0.SupplementID,
  L_0.Price,
  L_0.Type_code,
  coalesce(localized_1.Description, L_0.Description) AS Description,
  L_0.CurrencyCode_code
FROM (sap_fe_cap_travel_Supplement AS L_0 LEFT JOIN sap_fe_cap_travel_Supplement_texts AS localized_1 ON localized_1.SupplementID = L_0.SupplementID AND localized_1.locale = 'en');

CREATE VIEW localized_sap_fe_cap_travel_SupplementType AS SELECT
  coalesce(localized_1.name, L_0.name) AS name,
  coalesce(localized_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_fe_cap_travel_SupplementType AS L_0 LEFT JOIN sap_fe_cap_travel_SupplementType_texts AS localized_1 ON localized_1.code = L_0.code AND localized_1.locale = 'en');

CREATE VIEW localized_sap_fe_cap_travel_TravelStatus AS SELECT
  coalesce(localized_1.name, L_0.name) AS name,
  coalesce(localized_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_fe_cap_travel_TravelStatus AS L_0 LEFT JOIN sap_fe_cap_travel_TravelStatus_texts AS localized_1 ON localized_1.code = L_0.code AND localized_1.locale = 'en');

CREATE VIEW localized_sap_fe_cap_travel_Airline AS SELECT
  L.AirlineID,
  L.Name,
  L.CurrencyCode_code
FROM sap_fe_cap_travel_Airline AS L;

CREATE VIEW localized_sap_fe_cap_travel_Airport AS SELECT
  L.AirportID,
  L.Name,
  L.City,
  L.CountryCode_code
FROM sap_fe_cap_travel_Airport AS L;

CREATE VIEW localized_sap_fe_cap_travel_Booking AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.BookingUUID,
  L.BookingID,
  L.BookingDate,
  L.ConnectionID,
  L.FlightDate,
  L.FlightPrice,
  L.CurrencyCode_code,
  L.BookingStatus_code,
  L.to_Carrier_AirlineID,
  L.to_Customer_CustomerID,
  L.to_Travel_TravelUUID
FROM sap_fe_cap_travel_Booking AS L;

CREATE VIEW localized_sap_fe_cap_travel_BookingSupplement AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.BookSupplUUID,
  L.BookingSupplementID,
  L.Price,
  L.CurrencyCode_code,
  L.to_Booking_BookingUUID,
  L.to_Travel_TravelUUID,
  L.to_Supplement_SupplementID
FROM sap_fe_cap_travel_BookingSupplement AS L;

CREATE VIEW localized_sap_fe_cap_travel_Flight AS SELECT
  L.AirlineID,
  L.FlightDate,
  L.ConnectionID,
  L.Price,
  L.CurrencyCode_code,
  L.PlaneType,
  L.MaximumSeats,
  L.OccupiedSeats
FROM sap_fe_cap_travel_Flight AS L;

CREATE VIEW localized_sap_fe_cap_travel_Passenger AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.CustomerID,
  L.FirstName,
  L.LastName,
  L.Title,
  L.Street,
  L.PostalCode,
  L.City,
  L.CountryCode_code,
  L.PhoneNumber,
  L.EMailAddress
FROM sap_fe_cap_travel_Passenger AS L;

CREATE VIEW localized_sap_fe_cap_travel_Travel AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.TravelUUID,
  L.TravelID,
  L.BeginDate,
  L.EndDate,
  L.BookingFee,
  L.TotalPrice,
  L.CurrencyCode_code,
  L.Description,
  L.TravelStatus_code,
  L.to_Agency_AgencyID,
  L.to_Customer_CustomerID
FROM sap_fe_cap_travel_Travel AS L;

CREATE VIEW localized_sap_fe_cap_travel_TravelAgency AS SELECT
  L.AgencyID,
  L.Name,
  L.Street,
  L.PostalCode,
  L.City,
  L.CountryCode_code,
  L.PhoneNumber,
  L.EMailAddress,
  L.WebAddress
FROM sap_fe_cap_travel_TravelAgency AS L;

CREATE VIEW localized_sap_fe_cap_travel_FlightConnection AS SELECT
  L.ConnectionID,
  L.AirlineID,
  L.DepartureAirport_AirportID,
  L.DestinationAirport_AirportID,
  L.DepartureTime,
  L.ArrivalTime,
  L.Distance,
  L.DistanceUnit
FROM sap_fe_cap_travel_FlightConnection AS L;

CREATE VIEW TravelService_DraftAdministrativeData AS SELECT
  DraftAdministrativeData.DraftUUID,
  DraftAdministrativeData.CreationDateTime,
  DraftAdministrativeData.CreatedByUser,
  DraftAdministrativeData.DraftIsCreatedByMe,
  DraftAdministrativeData.LastChangeDateTime,
  DraftAdministrativeData.LastChangedByUser,
  DraftAdministrativeData.InProcessByUser,
  DraftAdministrativeData.DraftIsProcessedByMe
FROM DRAFT_DraftAdministrativeData AS DraftAdministrativeData;

CREATE VIEW localized_TravelService_BookingStatus AS SELECT
  BookingStatus_0.name,
  BookingStatus_0.descr,
  BookingStatus_0.code
FROM localized_sap_fe_cap_travel_BookingStatus AS BookingStatus_0;

CREATE VIEW localized_TravelService_Countries AS SELECT
  Countries_0.name,
  Countries_0.descr,
  Countries_0.code
FROM localized_sap_common_Countries AS Countries_0;

CREATE VIEW localized_TravelService_Currencies AS SELECT
  Currencies_0.name,
  Currencies_0.descr,
  Currencies_0.code,
  Currencies_0.symbol,
  Currencies_0.numcode,
  Currencies_0.exponent,
  Currencies_0.minor
FROM localized_sap_common_Currencies AS Currencies_0;

CREATE VIEW localized_TravelService_Supplement AS SELECT
  Supplement_0.createdAt,
  Supplement_0.createdBy,
  Supplement_0.LastChangedAt,
  Supplement_0.LastChangedBy,
  Supplement_0.SupplementID,
  Supplement_0.Price,
  Supplement_0.Type_code,
  Supplement_0.Description,
  Supplement_0.CurrencyCode_code
FROM localized_sap_fe_cap_travel_Supplement AS Supplement_0;

CREATE VIEW localized_TravelService_SupplementType AS SELECT
  SupplementType_0.name,
  SupplementType_0.descr,
  SupplementType_0.code
FROM localized_sap_fe_cap_travel_SupplementType AS SupplementType_0;

CREATE VIEW localized_TravelService_TravelStatus AS SELECT
  TravelStatus_0.name,
  TravelStatus_0.descr,
  TravelStatus_0.code
FROM localized_sap_fe_cap_travel_TravelStatus AS TravelStatus_0;

CREATE VIEW localized_TravelService_Booking AS SELECT
  Booking_0.createdAt,
  Booking_0.createdBy,
  Booking_0.LastChangedAt,
  Booking_0.LastChangedBy,
  Booking_0.BookingUUID,
  Booking_0.BookingID,
  Booking_0.BookingDate,
  Booking_0.ConnectionID,
  Booking_0.FlightDate,
  Booking_0.FlightPrice,
  Booking_0.CurrencyCode_code,
  Booking_0.BookingStatus_code,
  Booking_0.to_Carrier_AirlineID,
  Booking_0.to_Customer_CustomerID,
  Booking_0.to_Travel_TravelUUID
FROM localized_sap_fe_cap_travel_Booking AS Booking_0;

CREATE VIEW localized_TravelService_Airport AS SELECT
  Airport_0.AirportID,
  Airport_0.Name,
  Airport_0.City,
  Airport_0.CountryCode_code
FROM localized_sap_fe_cap_travel_Airport AS Airport_0;

CREATE VIEW localized_TravelService_Passenger AS SELECT
  Passenger_0.createdAt,
  Passenger_0.createdBy,
  Passenger_0.LastChangedAt,
  Passenger_0.LastChangedBy,
  Passenger_0.CustomerID,
  Passenger_0.FirstName,
  Passenger_0.LastName,
  Passenger_0.Title,
  Passenger_0.Street,
  Passenger_0.PostalCode,
  Passenger_0.City,
  Passenger_0.CountryCode_code,
  Passenger_0.PhoneNumber,
  Passenger_0.EMailAddress
FROM localized_sap_fe_cap_travel_Passenger AS Passenger_0;

CREATE VIEW localized_TravelService_TravelAgency AS SELECT
  TravelAgency_0.AgencyID,
  TravelAgency_0.Name,
  TravelAgency_0.Street,
  TravelAgency_0.PostalCode,
  TravelAgency_0.City,
  TravelAgency_0.CountryCode_code,
  TravelAgency_0.PhoneNumber,
  TravelAgency_0.EMailAddress,
  TravelAgency_0.WebAddress
FROM localized_sap_fe_cap_travel_TravelAgency AS TravelAgency_0;

CREATE VIEW localized_TravelService_Airline AS SELECT
  Airline_0.AirlineID,
  Airline_0.Name,
  Airline_0.CurrencyCode_code
FROM localized_sap_fe_cap_travel_Airline AS Airline_0;

CREATE VIEW localized_TravelService_BookingSupplement AS SELECT
  BookingSupplement_0.createdAt,
  BookingSupplement_0.createdBy,
  BookingSupplement_0.LastChangedAt,
  BookingSupplement_0.LastChangedBy,
  BookingSupplement_0.BookSupplUUID,
  BookingSupplement_0.BookingSupplementID,
  BookingSupplement_0.Price,
  BookingSupplement_0.CurrencyCode_code,
  BookingSupplement_0.to_Booking_BookingUUID,
  BookingSupplement_0.to_Travel_TravelUUID,
  BookingSupplement_0.to_Supplement_SupplementID
FROM localized_sap_fe_cap_travel_BookingSupplement AS BookingSupplement_0;

CREATE VIEW localized_TravelService_Flight AS SELECT
  Flight_0.AirlineID,
  Flight_0.FlightDate,
  Flight_0.ConnectionID,
  Flight_0.Price,
  Flight_0.CurrencyCode_code,
  Flight_0.PlaneType,
  Flight_0.MaximumSeats,
  Flight_0.OccupiedSeats
FROM localized_sap_fe_cap_travel_Flight AS Flight_0;

CREATE VIEW localized_TravelService_Travel AS SELECT
  Travel_0.createdAt,
  Travel_0.createdBy,
  Travel_0.LastChangedAt,
  Travel_0.LastChangedBy,
  Travel_0.TravelUUID,
  Travel_0.TravelID,
  Travel_0.BeginDate,
  Travel_0.EndDate,
  Travel_0.BookingFee,
  Travel_0.TotalPrice,
  Travel_0.CurrencyCode_code,
  Travel_0.Description,
  Travel_0.TravelStatus_code,
  Travel_0.to_Agency_AgencyID,
  Travel_0.to_Customer_CustomerID
FROM localized_sap_fe_cap_travel_Travel AS Travel_0;

CREATE VIEW localized_TravelService_FlightConnection AS SELECT
  FlightConnection_0.ConnectionID,
  FlightConnection_0.AirlineID,
  FlightConnection_0.DepartureAirport_AirportID,
  FlightConnection_0.DestinationAirport_AirportID,
  FlightConnection_0.DepartureTime,
  FlightConnection_0.ArrivalTime,
  FlightConnection_0.Distance,
  FlightConnection_0.DistanceUnit
FROM localized_sap_fe_cap_travel_FlightConnection AS FlightConnection_0;

CREATE VIEW localized_de_sap_common_Countries AS SELECT
  coalesce(localized_de_1.name, L_0.name) AS name,
  coalesce(localized_de_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_common_Countries AS L_0 LEFT JOIN sap_common_Countries_texts AS localized_de_1 ON localized_de_1.code = L_0.code AND localized_de_1.locale = 'de');

CREATE VIEW localized_fr_sap_common_Countries AS SELECT
  coalesce(localized_fr_1.name, L_0.name) AS name,
  coalesce(localized_fr_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_common_Countries AS L_0 LEFT JOIN sap_common_Countries_texts AS localized_fr_1 ON localized_fr_1.code = L_0.code AND localized_fr_1.locale = 'fr');

CREATE VIEW localized_de_sap_common_Currencies AS SELECT
  coalesce(localized_de_1.name, L_0.name) AS name,
  coalesce(localized_de_1.descr, L_0.descr) AS descr,
  L_0.code,
  L_0.symbol,
  L_0.numcode,
  L_0.exponent,
  L_0.minor
FROM (sap_common_Currencies AS L_0 LEFT JOIN sap_common_Currencies_texts AS localized_de_1 ON localized_de_1.code = L_0.code AND localized_de_1.locale = 'de');

CREATE VIEW localized_fr_sap_common_Currencies AS SELECT
  coalesce(localized_fr_1.name, L_0.name) AS name,
  coalesce(localized_fr_1.descr, L_0.descr) AS descr,
  L_0.code,
  L_0.symbol,
  L_0.numcode,
  L_0.exponent,
  L_0.minor
FROM (sap_common_Currencies AS L_0 LEFT JOIN sap_common_Currencies_texts AS localized_fr_1 ON localized_fr_1.code = L_0.code AND localized_fr_1.locale = 'fr');

CREATE VIEW localized_de_sap_fe_cap_travel_BookingStatus AS SELECT
  coalesce(localized_de_1.name, L_0.name) AS name,
  coalesce(localized_de_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_fe_cap_travel_BookingStatus AS L_0 LEFT JOIN sap_fe_cap_travel_BookingStatus_texts AS localized_de_1 ON localized_de_1.code = L_0.code AND localized_de_1.locale = 'de');

CREATE VIEW localized_fr_sap_fe_cap_travel_BookingStatus AS SELECT
  coalesce(localized_fr_1.name, L_0.name) AS name,
  coalesce(localized_fr_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_fe_cap_travel_BookingStatus AS L_0 LEFT JOIN sap_fe_cap_travel_BookingStatus_texts AS localized_fr_1 ON localized_fr_1.code = L_0.code AND localized_fr_1.locale = 'fr');

CREATE VIEW localized_de_sap_fe_cap_travel_Supplement AS SELECT
  L_0.createdAt,
  L_0.createdBy,
  L_0.LastChangedAt,
  L_0.LastChangedBy,
  L_0.SupplementID,
  L_0.Price,
  L_0.Type_code,
  coalesce(localized_de_1.Description, L_0.Description) AS Description,
  L_0.CurrencyCode_code
FROM (sap_fe_cap_travel_Supplement AS L_0 LEFT JOIN sap_fe_cap_travel_Supplement_texts AS localized_de_1 ON localized_de_1.SupplementID = L_0.SupplementID AND localized_de_1.locale = 'de');

CREATE VIEW localized_fr_sap_fe_cap_travel_Supplement AS SELECT
  L_0.createdAt,
  L_0.createdBy,
  L_0.LastChangedAt,
  L_0.LastChangedBy,
  L_0.SupplementID,
  L_0.Price,
  L_0.Type_code,
  coalesce(localized_fr_1.Description, L_0.Description) AS Description,
  L_0.CurrencyCode_code
FROM (sap_fe_cap_travel_Supplement AS L_0 LEFT JOIN sap_fe_cap_travel_Supplement_texts AS localized_fr_1 ON localized_fr_1.SupplementID = L_0.SupplementID AND localized_fr_1.locale = 'fr');

CREATE VIEW localized_de_sap_fe_cap_travel_SupplementType AS SELECT
  coalesce(localized_de_1.name, L_0.name) AS name,
  coalesce(localized_de_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_fe_cap_travel_SupplementType AS L_0 LEFT JOIN sap_fe_cap_travel_SupplementType_texts AS localized_de_1 ON localized_de_1.code = L_0.code AND localized_de_1.locale = 'de');

CREATE VIEW localized_fr_sap_fe_cap_travel_SupplementType AS SELECT
  coalesce(localized_fr_1.name, L_0.name) AS name,
  coalesce(localized_fr_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_fe_cap_travel_SupplementType AS L_0 LEFT JOIN sap_fe_cap_travel_SupplementType_texts AS localized_fr_1 ON localized_fr_1.code = L_0.code AND localized_fr_1.locale = 'fr');

CREATE VIEW localized_de_sap_fe_cap_travel_TravelStatus AS SELECT
  coalesce(localized_de_1.name, L_0.name) AS name,
  coalesce(localized_de_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_fe_cap_travel_TravelStatus AS L_0 LEFT JOIN sap_fe_cap_travel_TravelStatus_texts AS localized_de_1 ON localized_de_1.code = L_0.code AND localized_de_1.locale = 'de');

CREATE VIEW localized_fr_sap_fe_cap_travel_TravelStatus AS SELECT
  coalesce(localized_fr_1.name, L_0.name) AS name,
  coalesce(localized_fr_1.descr, L_0.descr) AS descr,
  L_0.code
FROM (sap_fe_cap_travel_TravelStatus AS L_0 LEFT JOIN sap_fe_cap_travel_TravelStatus_texts AS localized_fr_1 ON localized_fr_1.code = L_0.code AND localized_fr_1.locale = 'fr');

CREATE VIEW localized_de_sap_fe_cap_travel_Airline AS SELECT
  L.AirlineID,
  L.Name,
  L.CurrencyCode_code
FROM sap_fe_cap_travel_Airline AS L;

CREATE VIEW localized_fr_sap_fe_cap_travel_Airline AS SELECT
  L.AirlineID,
  L.Name,
  L.CurrencyCode_code
FROM sap_fe_cap_travel_Airline AS L;

CREATE VIEW localized_de_sap_fe_cap_travel_Airport AS SELECT
  L.AirportID,
  L.Name,
  L.City,
  L.CountryCode_code
FROM sap_fe_cap_travel_Airport AS L;

CREATE VIEW localized_fr_sap_fe_cap_travel_Airport AS SELECT
  L.AirportID,
  L.Name,
  L.City,
  L.CountryCode_code
FROM sap_fe_cap_travel_Airport AS L;

CREATE VIEW localized_de_sap_fe_cap_travel_Booking AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.BookingUUID,
  L.BookingID,
  L.BookingDate,
  L.ConnectionID,
  L.FlightDate,
  L.FlightPrice,
  L.CurrencyCode_code,
  L.BookingStatus_code,
  L.to_Carrier_AirlineID,
  L.to_Customer_CustomerID,
  L.to_Travel_TravelUUID
FROM sap_fe_cap_travel_Booking AS L;

CREATE VIEW localized_fr_sap_fe_cap_travel_Booking AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.BookingUUID,
  L.BookingID,
  L.BookingDate,
  L.ConnectionID,
  L.FlightDate,
  L.FlightPrice,
  L.CurrencyCode_code,
  L.BookingStatus_code,
  L.to_Carrier_AirlineID,
  L.to_Customer_CustomerID,
  L.to_Travel_TravelUUID
FROM sap_fe_cap_travel_Booking AS L;

CREATE VIEW localized_de_sap_fe_cap_travel_BookingSupplement AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.BookSupplUUID,
  L.BookingSupplementID,
  L.Price,
  L.CurrencyCode_code,
  L.to_Booking_BookingUUID,
  L.to_Travel_TravelUUID,
  L.to_Supplement_SupplementID
FROM sap_fe_cap_travel_BookingSupplement AS L;

CREATE VIEW localized_fr_sap_fe_cap_travel_BookingSupplement AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.BookSupplUUID,
  L.BookingSupplementID,
  L.Price,
  L.CurrencyCode_code,
  L.to_Booking_BookingUUID,
  L.to_Travel_TravelUUID,
  L.to_Supplement_SupplementID
FROM sap_fe_cap_travel_BookingSupplement AS L;

CREATE VIEW localized_de_sap_fe_cap_travel_Flight AS SELECT
  L.AirlineID,
  L.FlightDate,
  L.ConnectionID,
  L.Price,
  L.CurrencyCode_code,
  L.PlaneType,
  L.MaximumSeats,
  L.OccupiedSeats
FROM sap_fe_cap_travel_Flight AS L;

CREATE VIEW localized_fr_sap_fe_cap_travel_Flight AS SELECT
  L.AirlineID,
  L.FlightDate,
  L.ConnectionID,
  L.Price,
  L.CurrencyCode_code,
  L.PlaneType,
  L.MaximumSeats,
  L.OccupiedSeats
FROM sap_fe_cap_travel_Flight AS L;

CREATE VIEW localized_de_sap_fe_cap_travel_Passenger AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.CustomerID,
  L.FirstName,
  L.LastName,
  L.Title,
  L.Street,
  L.PostalCode,
  L.City,
  L.CountryCode_code,
  L.PhoneNumber,
  L.EMailAddress
FROM sap_fe_cap_travel_Passenger AS L;

CREATE VIEW localized_fr_sap_fe_cap_travel_Passenger AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.CustomerID,
  L.FirstName,
  L.LastName,
  L.Title,
  L.Street,
  L.PostalCode,
  L.City,
  L.CountryCode_code,
  L.PhoneNumber,
  L.EMailAddress
FROM sap_fe_cap_travel_Passenger AS L;

CREATE VIEW localized_de_sap_fe_cap_travel_Travel AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.TravelUUID,
  L.TravelID,
  L.BeginDate,
  L.EndDate,
  L.BookingFee,
  L.TotalPrice,
  L.CurrencyCode_code,
  L.Description,
  L.TravelStatus_code,
  L.to_Agency_AgencyID,
  L.to_Customer_CustomerID
FROM sap_fe_cap_travel_Travel AS L;

CREATE VIEW localized_fr_sap_fe_cap_travel_Travel AS SELECT
  L.createdAt,
  L.createdBy,
  L.LastChangedAt,
  L.LastChangedBy,
  L.TravelUUID,
  L.TravelID,
  L.BeginDate,
  L.EndDate,
  L.BookingFee,
  L.TotalPrice,
  L.CurrencyCode_code,
  L.Description,
  L.TravelStatus_code,
  L.to_Agency_AgencyID,
  L.to_Customer_CustomerID
FROM sap_fe_cap_travel_Travel AS L;

CREATE VIEW localized_de_sap_fe_cap_travel_TravelAgency AS SELECT
  L.AgencyID,
  L.Name,
  L.Street,
  L.PostalCode,
  L.City,
  L.CountryCode_code,
  L.PhoneNumber,
  L.EMailAddress,
  L.WebAddress
FROM sap_fe_cap_travel_TravelAgency AS L;

CREATE VIEW localized_fr_sap_fe_cap_travel_TravelAgency AS SELECT
  L.AgencyID,
  L.Name,
  L.Street,
  L.PostalCode,
  L.City,
  L.CountryCode_code,
  L.PhoneNumber,
  L.EMailAddress,
  L.WebAddress
FROM sap_fe_cap_travel_TravelAgency AS L;

CREATE VIEW localized_de_sap_fe_cap_travel_FlightConnection AS SELECT
  L.ConnectionID,
  L.AirlineID,
  L.DepartureAirport_AirportID,
  L.DestinationAirport_AirportID,
  L.DepartureTime,
  L.ArrivalTime,
  L.Distance,
  L.DistanceUnit
FROM sap_fe_cap_travel_FlightConnection AS L;

CREATE VIEW localized_fr_sap_fe_cap_travel_FlightConnection AS SELECT
  L.ConnectionID,
  L.AirlineID,
  L.DepartureAirport_AirportID,
  L.DestinationAirport_AirportID,
  L.DepartureTime,
  L.ArrivalTime,
  L.Distance,
  L.DistanceUnit
FROM sap_fe_cap_travel_FlightConnection AS L;

CREATE VIEW localized_de_TravelService_BookingStatus AS SELECT
  BookingStatus_0.name,
  BookingStatus_0.descr,
  BookingStatus_0.code
FROM localized_de_sap_fe_cap_travel_BookingStatus AS BookingStatus_0;

CREATE VIEW localized_fr_TravelService_BookingStatus AS SELECT
  BookingStatus_0.name,
  BookingStatus_0.descr,
  BookingStatus_0.code
FROM localized_fr_sap_fe_cap_travel_BookingStatus AS BookingStatus_0;

CREATE VIEW localized_de_TravelService_Countries AS SELECT
  Countries_0.name,
  Countries_0.descr,
  Countries_0.code
FROM localized_de_sap_common_Countries AS Countries_0;

CREATE VIEW localized_fr_TravelService_Countries AS SELECT
  Countries_0.name,
  Countries_0.descr,
  Countries_0.code
FROM localized_fr_sap_common_Countries AS Countries_0;

CREATE VIEW localized_de_TravelService_Currencies AS SELECT
  Currencies_0.name,
  Currencies_0.descr,
  Currencies_0.code,
  Currencies_0.symbol,
  Currencies_0.numcode,
  Currencies_0.exponent,
  Currencies_0.minor
FROM localized_de_sap_common_Currencies AS Currencies_0;

CREATE VIEW localized_fr_TravelService_Currencies AS SELECT
  Currencies_0.name,
  Currencies_0.descr,
  Currencies_0.code,
  Currencies_0.symbol,
  Currencies_0.numcode,
  Currencies_0.exponent,
  Currencies_0.minor
FROM localized_fr_sap_common_Currencies AS Currencies_0;

CREATE VIEW localized_de_TravelService_Supplement AS SELECT
  Supplement_0.createdAt,
  Supplement_0.createdBy,
  Supplement_0.LastChangedAt,
  Supplement_0.LastChangedBy,
  Supplement_0.SupplementID,
  Supplement_0.Price,
  Supplement_0.Type_code,
  Supplement_0.Description,
  Supplement_0.CurrencyCode_code
FROM localized_de_sap_fe_cap_travel_Supplement AS Supplement_0;

CREATE VIEW localized_fr_TravelService_Supplement AS SELECT
  Supplement_0.createdAt,
  Supplement_0.createdBy,
  Supplement_0.LastChangedAt,
  Supplement_0.LastChangedBy,
  Supplement_0.SupplementID,
  Supplement_0.Price,
  Supplement_0.Type_code,
  Supplement_0.Description,
  Supplement_0.CurrencyCode_code
FROM localized_fr_sap_fe_cap_travel_Supplement AS Supplement_0;

CREATE VIEW localized_de_TravelService_SupplementType AS SELECT
  SupplementType_0.name,
  SupplementType_0.descr,
  SupplementType_0.code
FROM localized_de_sap_fe_cap_travel_SupplementType AS SupplementType_0;

CREATE VIEW localized_fr_TravelService_SupplementType AS SELECT
  SupplementType_0.name,
  SupplementType_0.descr,
  SupplementType_0.code
FROM localized_fr_sap_fe_cap_travel_SupplementType AS SupplementType_0;

CREATE VIEW localized_de_TravelService_TravelStatus AS SELECT
  TravelStatus_0.name,
  TravelStatus_0.descr,
  TravelStatus_0.code
FROM localized_de_sap_fe_cap_travel_TravelStatus AS TravelStatus_0;

CREATE VIEW localized_fr_TravelService_TravelStatus AS SELECT
  TravelStatus_0.name,
  TravelStatus_0.descr,
  TravelStatus_0.code
FROM localized_fr_sap_fe_cap_travel_TravelStatus AS TravelStatus_0;

CREATE VIEW localized_de_TravelService_Booking AS SELECT
  Booking_0.createdAt,
  Booking_0.createdBy,
  Booking_0.LastChangedAt,
  Booking_0.LastChangedBy,
  Booking_0.BookingUUID,
  Booking_0.BookingID,
  Booking_0.BookingDate,
  Booking_0.ConnectionID,
  Booking_0.FlightDate,
  Booking_0.FlightPrice,
  Booking_0.CurrencyCode_code,
  Booking_0.BookingStatus_code,
  Booking_0.to_Carrier_AirlineID,
  Booking_0.to_Customer_CustomerID,
  Booking_0.to_Travel_TravelUUID
FROM localized_de_sap_fe_cap_travel_Booking AS Booking_0;

CREATE VIEW localized_fr_TravelService_Booking AS SELECT
  Booking_0.createdAt,
  Booking_0.createdBy,
  Booking_0.LastChangedAt,
  Booking_0.LastChangedBy,
  Booking_0.BookingUUID,
  Booking_0.BookingID,
  Booking_0.BookingDate,
  Booking_0.ConnectionID,
  Booking_0.FlightDate,
  Booking_0.FlightPrice,
  Booking_0.CurrencyCode_code,
  Booking_0.BookingStatus_code,
  Booking_0.to_Carrier_AirlineID,
  Booking_0.to_Customer_CustomerID,
  Booking_0.to_Travel_TravelUUID
FROM localized_fr_sap_fe_cap_travel_Booking AS Booking_0;

CREATE VIEW localized_de_TravelService_Airport AS SELECT
  Airport_0.AirportID,
  Airport_0.Name,
  Airport_0.City,
  Airport_0.CountryCode_code
FROM localized_de_sap_fe_cap_travel_Airport AS Airport_0;

CREATE VIEW localized_fr_TravelService_Airport AS SELECT
  Airport_0.AirportID,
  Airport_0.Name,
  Airport_0.City,
  Airport_0.CountryCode_code
FROM localized_fr_sap_fe_cap_travel_Airport AS Airport_0;

CREATE VIEW localized_de_TravelService_Passenger AS SELECT
  Passenger_0.createdAt,
  Passenger_0.createdBy,
  Passenger_0.LastChangedAt,
  Passenger_0.LastChangedBy,
  Passenger_0.CustomerID,
  Passenger_0.FirstName,
  Passenger_0.LastName,
  Passenger_0.Title,
  Passenger_0.Street,
  Passenger_0.PostalCode,
  Passenger_0.City,
  Passenger_0.CountryCode_code,
  Passenger_0.PhoneNumber,
  Passenger_0.EMailAddress
FROM localized_de_sap_fe_cap_travel_Passenger AS Passenger_0;

CREATE VIEW localized_fr_TravelService_Passenger AS SELECT
  Passenger_0.createdAt,
  Passenger_0.createdBy,
  Passenger_0.LastChangedAt,
  Passenger_0.LastChangedBy,
  Passenger_0.CustomerID,
  Passenger_0.FirstName,
  Passenger_0.LastName,
  Passenger_0.Title,
  Passenger_0.Street,
  Passenger_0.PostalCode,
  Passenger_0.City,
  Passenger_0.CountryCode_code,
  Passenger_0.PhoneNumber,
  Passenger_0.EMailAddress
FROM localized_fr_sap_fe_cap_travel_Passenger AS Passenger_0;

CREATE VIEW localized_de_TravelService_TravelAgency AS SELECT
  TravelAgency_0.AgencyID,
  TravelAgency_0.Name,
  TravelAgency_0.Street,
  TravelAgency_0.PostalCode,
  TravelAgency_0.City,
  TravelAgency_0.CountryCode_code,
  TravelAgency_0.PhoneNumber,
  TravelAgency_0.EMailAddress,
  TravelAgency_0.WebAddress
FROM localized_de_sap_fe_cap_travel_TravelAgency AS TravelAgency_0;

CREATE VIEW localized_fr_TravelService_TravelAgency AS SELECT
  TravelAgency_0.AgencyID,
  TravelAgency_0.Name,
  TravelAgency_0.Street,
  TravelAgency_0.PostalCode,
  TravelAgency_0.City,
  TravelAgency_0.CountryCode_code,
  TravelAgency_0.PhoneNumber,
  TravelAgency_0.EMailAddress,
  TravelAgency_0.WebAddress
FROM localized_fr_sap_fe_cap_travel_TravelAgency AS TravelAgency_0;

CREATE VIEW localized_de_TravelService_Airline AS SELECT
  Airline_0.AirlineID,
  Airline_0.Name,
  Airline_0.CurrencyCode_code
FROM localized_de_sap_fe_cap_travel_Airline AS Airline_0;

CREATE VIEW localized_fr_TravelService_Airline AS SELECT
  Airline_0.AirlineID,
  Airline_0.Name,
  Airline_0.CurrencyCode_code
FROM localized_fr_sap_fe_cap_travel_Airline AS Airline_0;

CREATE VIEW localized_de_TravelService_BookingSupplement AS SELECT
  BookingSupplement_0.createdAt,
  BookingSupplement_0.createdBy,
  BookingSupplement_0.LastChangedAt,
  BookingSupplement_0.LastChangedBy,
  BookingSupplement_0.BookSupplUUID,
  BookingSupplement_0.BookingSupplementID,
  BookingSupplement_0.Price,
  BookingSupplement_0.CurrencyCode_code,
  BookingSupplement_0.to_Booking_BookingUUID,
  BookingSupplement_0.to_Travel_TravelUUID,
  BookingSupplement_0.to_Supplement_SupplementID
FROM localized_de_sap_fe_cap_travel_BookingSupplement AS BookingSupplement_0;

CREATE VIEW localized_fr_TravelService_BookingSupplement AS SELECT
  BookingSupplement_0.createdAt,
  BookingSupplement_0.createdBy,
  BookingSupplement_0.LastChangedAt,
  BookingSupplement_0.LastChangedBy,
  BookingSupplement_0.BookSupplUUID,
  BookingSupplement_0.BookingSupplementID,
  BookingSupplement_0.Price,
  BookingSupplement_0.CurrencyCode_code,
  BookingSupplement_0.to_Booking_BookingUUID,
  BookingSupplement_0.to_Travel_TravelUUID,
  BookingSupplement_0.to_Supplement_SupplementID
FROM localized_fr_sap_fe_cap_travel_BookingSupplement AS BookingSupplement_0;

CREATE VIEW localized_de_TravelService_Flight AS SELECT
  Flight_0.AirlineID,
  Flight_0.FlightDate,
  Flight_0.ConnectionID,
  Flight_0.Price,
  Flight_0.CurrencyCode_code,
  Flight_0.PlaneType,
  Flight_0.MaximumSeats,
  Flight_0.OccupiedSeats
FROM localized_de_sap_fe_cap_travel_Flight AS Flight_0;

CREATE VIEW localized_fr_TravelService_Flight AS SELECT
  Flight_0.AirlineID,
  Flight_0.FlightDate,
  Flight_0.ConnectionID,
  Flight_0.Price,
  Flight_0.CurrencyCode_code,
  Flight_0.PlaneType,
  Flight_0.MaximumSeats,
  Flight_0.OccupiedSeats
FROM localized_fr_sap_fe_cap_travel_Flight AS Flight_0;

CREATE VIEW localized_de_TravelService_Travel AS SELECT
  Travel_0.createdAt,
  Travel_0.createdBy,
  Travel_0.LastChangedAt,
  Travel_0.LastChangedBy,
  Travel_0.TravelUUID,
  Travel_0.TravelID,
  Travel_0.BeginDate,
  Travel_0.EndDate,
  Travel_0.BookingFee,
  Travel_0.TotalPrice,
  Travel_0.CurrencyCode_code,
  Travel_0.Description,
  Travel_0.TravelStatus_code,
  Travel_0.to_Agency_AgencyID,
  Travel_0.to_Customer_CustomerID
FROM localized_de_sap_fe_cap_travel_Travel AS Travel_0;

CREATE VIEW localized_fr_TravelService_Travel AS SELECT
  Travel_0.createdAt,
  Travel_0.createdBy,
  Travel_0.LastChangedAt,
  Travel_0.LastChangedBy,
  Travel_0.TravelUUID,
  Travel_0.TravelID,
  Travel_0.BeginDate,
  Travel_0.EndDate,
  Travel_0.BookingFee,
  Travel_0.TotalPrice,
  Travel_0.CurrencyCode_code,
  Travel_0.Description,
  Travel_0.TravelStatus_code,
  Travel_0.to_Agency_AgencyID,
  Travel_0.to_Customer_CustomerID
FROM localized_fr_sap_fe_cap_travel_Travel AS Travel_0;

CREATE VIEW localized_de_TravelService_FlightConnection AS SELECT
  FlightConnection_0.ConnectionID,
  FlightConnection_0.AirlineID,
  FlightConnection_0.DepartureAirport_AirportID,
  FlightConnection_0.DestinationAirport_AirportID,
  FlightConnection_0.DepartureTime,
  FlightConnection_0.ArrivalTime,
  FlightConnection_0.Distance,
  FlightConnection_0.DistanceUnit
FROM localized_de_sap_fe_cap_travel_FlightConnection AS FlightConnection_0;

CREATE VIEW localized_fr_TravelService_FlightConnection AS SELECT
  FlightConnection_0.ConnectionID,
  FlightConnection_0.AirlineID,
  FlightConnection_0.DepartureAirport_AirportID,
  FlightConnection_0.DestinationAirport_AirportID,
  FlightConnection_0.DepartureTime,
  FlightConnection_0.ArrivalTime,
  FlightConnection_0.Distance,
  FlightConnection_0.DistanceUnit
FROM localized_fr_sap_fe_cap_travel_FlightConnection AS FlightConnection_0;

