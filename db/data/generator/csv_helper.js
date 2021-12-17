// Helper functions to read csv file into json and write json to csv file
//   for Flight, Travel, Booking, BookingSupplement

'use strict';

const fs = require('fs')
const {EOL} = require('os');

const path_out = './output/';
const path_csv = '../';
const prefix_sflight = 'sap.fe.cap.travel-';

const config = {
  // ---------- Flight ----------
  Flight: {
    csv_file: prefix_sflight + 'Flight.csv',
    json_file: null,
    header : 'AirlineID;ConnectionID;FlightDate;Price;CurrencyCode_code;PlaneType;MaximumSeats;OccupiedSeats',
    fromString: (line) => {
      var o = {};
      [ 
        o.carrier_id,
        o.connection_id,
        o.flight_date,
        o.price,
        o.currency_code,
        o.plane_type_id,
        o.seats_max,
        o.seats_occupied
      ] = line.split(';');
      return o;
    },
    toString: (o) => [
      o.carrier_id,
      o.connection_id,
      o.flight_date,
      o.price,
      o.currency_code,
      o.plane_type_id,
      o.seats_max,
      o.seats_occupied
    ].join(';')
  },
  // ---------- Travel ----------
  Travel: {
    csv_file: prefix_sflight + 'Travel.csv',
    json_file: null,
    header : 'TravelUUID;TravelID;to_Agency_AgencyID;to_Customer_CustomerID;BeginDate;EndDate;BookingFee;TotalPrice;CurrencyCode_code;Description;TravelStatus_code;createdBy;createdAt;LastChangedBy;LastChangedAt',
    fromString: (line) => {
      var o = {};
      [
        o.travelUuid,
        o.travelId,
        o.agency_id,
        o.customer_id,
        o.begin_date,
        o.end_date,
        o.booking_fee,
        o.total_price,
        o.currency_code,
        o.description,
        o.status,
        o.createdBy,
        o.createdAt,
        o.lastchangedby,
        o.lastchangedat
      ] = line.split(';');
      return o;
    },
    toString: (o) => [
      o.travelUuid,
      o.travelId,
      o.agency_id,
      o.customer_id,
      o.begin_date,
      o.end_date,
      o.booking_fee,
      o.total_price,
      o.currency_code,
      o.description,
      o.status,
      o.createdBy,
      o.createdAt,
      o.lastchangedby,
      o.lastchangedat
    ].join(';')
  },
  // ---------- Booking ----------
  Booking: {
    csv_file: prefix_sflight + 'Booking.csv',
    json_file: null,
    header : 'BookingUUID;to_Travel_TravelUUID;BookingID;BookingDate;to_Customer_CustomerID;to_Carrier_AirlineID;ConnectionID;FlightDate;FlightPrice;CurrencyCode_code;BookingStatus_code;LastChangedAt',
    fromString: (line) => {
      var o = {};
      [
        o.bookingUuid,
        o.travelUuid,
        o.bookingId,
        o.bookingDate,
        o.customer_id,
        o.carrier_id,
        o.connection_id,
        o.flight_date,
        o.flight_price,
        o.currency_code,
        o.booking_status,
        o.lastChangedAt
      ] = line.split(';');
      return o;
    },
    toString: (o) => [
      o.bookingUuid,
      o.travelUuid,
      o.bookingId,
      o.bookingDate,
      o.customer_id,
      o.carrier_id,
      o.connection_id,
      o.flight_date,
      o.flight_price,
      o.currency_code,
      o.booking_status,
      o.lastChangedAt
    ].join(';')
  },
  // ---------- BookingSupplement ----------
  BookingSupplement: {
    csv_file: prefix_sflight + 'BookingSupplement.csv',
    json_file: null,
    header : 'BookSupplUUID;to_Travel_TravelUUID;to_Booking_BookingUUID;BookingSupplementID;to_Supplement_SupplementID;Price;CurrencyCode_code;LastChangedAt',
    fromString: (line) => {
      var o = {};
      [
        o.booking_supplement_uuid,
        o.travelUuid,
        o.bookingUuid,
        o.booking_supplement_id,
        o.supplement_id,
        o.price,
        o.currency_code,
        o.lastChangedAt
      ] = line.split(';');
      return o;
    },
    toString: (o) => [
      o.booking_supplement_uuid,
      o.travelUuid,
      o.bookingUuid,
      o.booking_supplement_id,
      o.supplement_id,
      o.price,
      o.currency_code,
      o.lastChangedAt
    ].join(';')
  }
};

// table: one of Flight, Travel, Booking, BookingSupplement
// returns array
function readCSV(table) {
  let c = config[table];
  if (!c) throw 'Invalid table name ' + table;

  let s = fs.readFileSync(path_csv + c.csv_file, 'utf8')
  let a = s.split(/\r?\n/).filter(x => x.includes(';')).slice(1).map(c.fromString);  // slice: remove header line
  //console.log(JSON.stringify(o, null, 2))
  return a;
}

// table: one of Flight, Travel, Booking, BookingSupplement
// data: array
function writeCSV(table, data) {
  let c = config[table];
  if (!c) throw 'Invalid table name ' + table;

  var a = data.map(x => c.toString(x));
  a.unshift(c.header);
  var s = a.join(EOL);
  fs.writeFileSync(path_out + c.csv_file, s);
}


module.exports = {
  readCSV,
  writeCSV
};
