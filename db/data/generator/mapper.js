'use strict';

const Maps = {
  Flight: [
    'AirlineID',
    'ConnectionID',
    'FlightDate',
    'Price',
    'CurrencyCode_code',
    'PlaneType',
    'MaximumSeats',
    'OccupiedSeats',
  ],
  Travel: [
    'TravelUUID',
    'TravelID',
    'to_Agency_AgencyID',
    'to_Customer_CustomerID',
    'BeginDate',
    'EndDate',
    'BookingFee',
    'TotalPrice',
    'CurrencyCode_code',
    'Description',
    'TravelStatus_code',
    'createdBy',
    'createdAt',
    'LastChangedBy',
    'LastChangedAt',
  ],
  Booking: [
    'BookingUUID',
    'to_Travel_TravelUUID',
    'BookingID',
    'BookingDate',
    'to_Customer_CustomerID',
    'to_Carrier_AirlineID',
    'ConnectionID',
    'FlightDate',
    'FlightPrice',
    'CurrencyCode_code',
    'BookingStatus_code',
    'LastChangedAt',
  ],
  Supplement: [
    'BookSupplUUID',
    'to_Travel_TravelUUID',
    'to_Booking_BookingUUID',
    'BookingSupplementID',
    'to_Supplement_SupplementID',
    'Price',
    'CurrencyCode_code',
    'LastChangedAt',
  ]
}

function dbHeader(map) {
  return map.join(';');
}

function obj2string(o, map) {
  let t = map.map(m => o[m]);
  return t.join(';');
}
function arrObj2arrString(a, map) {
  return a.map(o => obj2string(o, map))
}

function string2obj(s, map) {
  var a = s.split(';');
  let rGen = {};
  for (let i = 0; i<map.length; i++) {
    rGen[map[i]] = a[i];
  }
  return rGen;
}

function arrString2arrObj(a, map) {
  return a.map(s => string2obj(s, map))
}


module.exports = {
  Maps,
  dbHeader,
  arrObj2arrString,
  arrString2arrObj
};



/*
// csv header lines for flight, travel, booking, bookingSupplement
const hf = 'AirlineID;ConnectionID;FlightDate;Price;CurrencyCode_code;PlaneType;MaximumSeats;OccupiedSeats';
const ht = 'TravelUUID;TravelID;to_Agency_AgencyID;to_Customer_CustomerID;BeginDate;EndDate;BookingFee;TotalPrice;CurrencyCode_code;Description;TravelStatus_code;createdBy;createdAt;LastChangedBy;LastChangedAt';
const hb = 'BookingUUID;to_Travel_TravelUUID;BookingID;BookingDate;to_Customer_CustomerID;to_Carrier_AirlineID;ConnectionID;FlightDate;FlightPrice;CurrencyCode_code;BookingStatus_code;LastChangedAt';
const hs = 'BookSupplUUID;to_Travel_TravelUUID;to_Booking_BookingUUID;BookingSupplementID;to_Supplement_SupplementID;Price;CurrencyCode_code;LastChangedAt';

function flightToString(f) {
  return [
    f.AirlineID,
    f.ConnectionID,
    f.FlightDate,
    f.Price,
    f.CurrencyCode_code,
    f.PlaneType,
    f.MaximumSeats,
    f.OccupiedSeats
  ].join(';')
}
function stringToFlight(line) {
  var o = {};
  [
    o.AirlineID,
    o.ConnectionID,
    o.FlightDate,
    o.Price,
    o.CurrencyCode_code,
    o.PlaneType,
    o.MaximumSeats,
    o.OccupiedSeats
  ] = line.split(';');
  return o;
}

function travelToString(t) {
  return [
    t.TravelUUID,
    t.TravelID,
    t.to_Agency_AgencyID,
    t.to_Customer_CustomerID,
    t.BeginDate,
    t.EndDate,
    t.BookingFee,
    t.TotalPrice,
    t.CurrencyCode_code,
    t.Description,
    t.TravelStatus_code,
    t.createdBy,
    t.createdAt,
    t.LastChangedBy,
    t.LastChangedAt
  ].join(';');
}
function stringToTravel(line) {
  var o = {};
  [
    o.TravelUUID,
    o.TravelID,
    o.to_Agency_AgencyID,
    o.to_Customer_CustomerID,
    o.BeginDate,
    o.EndDate,
    o.BookingFee,
    o.TotalPrice,
    o.CurrencyCode_code,
    o.Description,
    o.TravelStatus_code,
    o.createdBy,
    o.createdAt,
    o.LastChangedBy,
    o.LastChangedAt
  ] = line.split(';');
  return o;
}

function bookingToString(b) {
  return [
    b.BookingUUID,
    b.to_Travel_TravelUUID,
    b.BookingID,
    b.BookingDate,
    b.to_Customer_CustomerID,
    b.to_Carrier_AirlineID,
    b.ConnectionID,
    b.FlightDate,
    b.FlightPrice,
    b.CurrencyCode_code,
    b.BookingStatus_code,
    b.LastChangedAt
  ].join(';');
}
function stringToBooking(line) {
  var o = {};
  [
    o.BookingUUID,
    o.to_Travel_TravelUUID,
    o.BookingID,
    o.BookingDate,
    o.to_Customer_CustomerID,
    o.to_Carrier_AirlineID,
    o.ConnectionID,
    o.FlightDate,
    o.FlightPrice,
    o.CurrencyCode_code,
    o.BookingStatus_code,
    o.LastChangedAt
  ] = line.split(';');
  return o;
}

function bookingSupplementToString(s) {
  return [
    s.BookSupplUUID,
    s.to_Travel_TravelUUID,
    s.to_Booking_BookingUUID,
    s.BookingSupplementID,
    s.to_Supplement_SupplementID,
    s.Price,
    s.CurrencyCode_code,
    s.lastChanLastChangedAtgedAt
  ].join(';');
}
function stringToSupplement(line) {
  var o = {};
  [
    o.BookSupplUUID,
    o.to_Travel_TravelUUID,
    o.to_Booking_BookingUUID,
    o.BookingSupplementID,
    o.to_Supplement_SupplementID,
    o.Price,
    o.CurrencyCode_code,
    o.LastChangedAt
  ] = line.split(';');
  return o;
}

*/
