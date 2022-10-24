'use strict';

const Maps = {
  Flight: [
    {gen: 'carrier_id',     db: 'AirlineID'        },
    {gen: 'connection_id',  db: 'ConnectionID'     },
    {gen: 'flight_date',    db: 'FlightDate'       },
    {gen: 'price',          db: 'Price'            },
    {gen: 'currency_code',  db: 'CurrencyCode_code'},
    {gen: 'plane_type_id',  db: 'PlaneType'        },
    {gen: 'seats_max',      db: 'MaximumSeats'     },
    {gen: 'seats_occupied', db: 'OccupiedSeats'    }
  ],
  Travel: [
    {gen: 'travelUuid',    db: 'TravelUUID'             },
    {gen: 'travelId',      db: 'TravelID'               },
    {gen: 'agency_id',     db: 'to_Agency_AgencyID'     },
    {gen: 'customer_id',   db: 'to_Customer_CustomerID' },
    {gen: 'begin_date',    db: 'BeginDate'              },
    {gen: 'end_date',      db: 'EndDate'                },
    {gen: 'booking_fee',   db: 'BookingFee'             },
    {gen: 'total_price',   db: 'TotalPrice'             },
    {gen: 'currency_code', db: 'CurrencyCode_code'      },
    {gen: 'description',   db: 'Description'            },
    {gen: 'status',        db: 'TravelStatus_code'      },
    {gen: 'createdBy',     db: 'createdBy'              },
    {gen: 'createdAt',     db: 'createdAt'              },
    {gen: 'lastchangedby', db: 'LastChangedBy'          },
    {gen: 'lastchangedat', db: 'LastChangedAt'          }
  ],
  Booking: [
    {gen: 'bookingUuid',    db: 'BookingUUID'            },
    {gen: 'travelUuid',     db: 'to_Travel_TravelUUID'   },
    {gen: 'bookingId',      db: 'BookingID'              },
    {gen: 'bookingDate',    db: 'BookingDate'            },
    {gen: 'customer_id',    db: 'to_Customer_CustomerID' },
    {gen: 'carrier_id',     db: 'to_Carrier_AirlineID'   },
    {gen: 'connection_id',  db: 'ConnectionID'           },
    {gen: 'flight_date',    db: 'FlightDate'             },
    {gen: 'flight_price',   db: 'FlightPrice'            },
    {gen: 'currency_code',  db: 'CurrencyCode_code'      },
    {gen: 'booking_status', db: 'BookingStatus_code'     },
    {gen: 'lastChangedAt',  db: 'LastChangedAt'          }
  ],
  Supplement: [
    {gen: 'booking_supplement_uuid', db: 'BookSupplUUID'              },
    {gen: 'travelUuid',              db: 'to_Travel_TravelUUID'       },
    {gen: 'bookingUuid',             db: 'to_Booking_BookingUUID'     },
    {gen: 'booking_supplement_id',   db: 'BookingSupplementID'        },
    {gen: 'supplement_id',           db: 'to_Supplement_SupplementID' },
    {gen: 'price',                   db: 'Price'                      },
    {gen: 'currency_code',           db: 'CurrencyCode_code'          },
    {gen: 'lastChangedAt',           db: 'LastChangedAt'              }
  ]
}

function dbHeader(map) {
  let t = map.map(m => m.db);
  return t.join(';');
}

function rGen2string(rGen, map) {
  let t = rGen2arr(rGen, map);
  return t.join(';');
}

function string2rGen(s, map) {
  var a = s.split(';');
  return arr2rGen(a, map);
}

function rGen2arr(rGen, map) {
  let t = map.map(m => rGen[m.gen]);
  return t;
}

function arr2rGen(arr, map) {
  let rGen = {};
  for (let i = 0; i<map.length; i++) {
    rGen[map[i].gen] = arr[i];
  }
  return rGen;
}

function rGen2rDB(rGen, map) {
  let rDB = {};
  for (let m of map) {
    rDB[m.db] = rGen[m.gen]
  }
  return rDB;
}

module.exports = {
  Maps,
  dbHeader,
  rGen2string,
  string2rGen,
  rGen2arr,
  arr2rGen,
  rGen2rDB
};







/*
// csv header lines for flight, travel, booking, bookingSupplement
const hf = 'AirlineID;ConnectionID;FlightDate;Price;CurrencyCode_code;PlaneType;MaximumSeats;OccupiedSeats';
const ht = 'TravelUUID;TravelID;to_Agency_AgencyID;to_Customer_CustomerID;BeginDate;EndDate;BookingFee;TotalPrice;CurrencyCode_code;Description;TravelStatus_code;createdBy;createdAt;LastChangedBy;LastChangedAt';
const hb = 'BookingUUID;to_Travel_TravelUUID;BookingID;BookingDate;to_Customer_CustomerID;to_Carrier_AirlineID;ConnectionID;FlightDate;FlightPrice;CurrencyCode_code;BookingStatus_code;LastChangedAt';
const hs = 'BookSupplUUID;to_Travel_TravelUUID;to_Booking_BookingUUID;BookingSupplementID;to_Supplement_SupplementID;Price;CurrencyCode_code;LastChangedAt';

function flightToString(f) {
  return [
    f.carrier_id,
    f.connection_id,
    f.flight_date,
    f.price,
    f.currency_code,
    f.plane_type_id,
    f.seats_max,
    f.seats_occupied
  ].join(';')
}
function stringToFlight(line) {
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
}

function travelToString(t) {
  return [
    t.travelUuid,
    t.travelId,
    t.agency_id,
    t.customer_id,
    t.begin_date,
    t.end_date,
    t.booking_fee,
    t.total_price,
    t.currency_code,
    t.description,
    t.status,
    t.createdBy,
    t.createdAt,
    t.lastchangedby,
    t.lastchangedat
  ].join(';');
}
function stringToTravel(line) {
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
}

function bookingToString(b) {
  return [
    b.bookingUuid,
    b.travelUuid,
    b.bookingId,
    b.bookingDate,
    b.customer_id,
    b.carrier_id,
    b.connection_id,
    b.flight_date,
    b.flight_price,
    b.currency_code,
    b.booking_status,
    b.lastChangedAt
  ].join(';');
}
function stringToBooking(line) {
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
}

function bookingSupplementToString(s) {
  return [
    s.booking_supplement_uuid,
    s.travelUuid,
    s.bookingUuid,
    s.booking_supplement_id,
    s.supplement_id,
    s.price,
    s.currency_code,
    s.lastChangedAt
  ].join(';');
}
function stringToSupplement(line) {
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
}

*/
