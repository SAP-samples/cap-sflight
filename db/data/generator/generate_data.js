// ABAP: /dmo/cl_flight_data_generator 

'use strict';

const fs = require('fs');
const {EOL} = require('os');

const {v1 : uuidv4} = require('uuid');
const makeRealUUID = () => uuidv4().replace(/-/g, '');

// data used as input for data generation
const passengers = require('./input/customer.json');
const supplements = require('./input/supplement.json');
const countries = require('./input/countries.json');
const agencies = require('./input/agencies.json');

const airports = [
  // Europe
  { airport_id : 'FRA', name : 'Frankfurt Airport',                     city : 'Frankfurt/Main',                    country : 'DE' },
  { airport_id : 'HAM', name : 'Hamburg Airport',                       city : 'Hamburg',                           country : 'DE' },
  { airport_id : 'MUC', name : 'Munich Airport',                        city : 'Munich',                            country : 'DE' },
  { airport_id : 'SXF', name : 'Berlin Schönefeld Airport',             city : 'Berlin',                            country : 'DE' },
  { airport_id : 'THF', name : 'Berlin Tempelhof Airport',              city : 'Berlin',                            country : 'DE' },
  { airport_id : 'TXL', name : 'Berlin Tegel Airport',                  city : 'Berlin',                            country : 'DE' },
  { airport_id : 'CDG', name : 'Charles de Gaulle Airport',             city : 'Paris',                             country : 'FR' },
  { airport_id : 'ORY', name : 'Orly Airport',                          city : 'Paris',                             country : 'FR' },
  { airport_id : 'VIE', name : 'Vienna International Airport',          city : 'Vienna',                            country : 'AT' },
  { airport_id : 'ZRH', name : 'Zürich Airport',                        city : 'Zurich',                            country : 'CH' },
  { airport_id : 'RTM', name : 'Rotterdam The Hague Airport',           city : 'Rotterdam',                         country : 'NL' },
  { airport_id : 'FCO', name : 'Leonardo da Vinci–Fiumicino Airport',   city : 'Rome',                              country : 'IT' },
  { airport_id : 'VCE', name : 'Venice Marco Polo Airport',             city : 'Venice',                            country : 'IT' },
  { airport_id : 'LCY', name : 'London City Airport',                   city : 'London',                            country : 'UK' },
  { airport_id : 'LGW', name : 'Gatwick Airport',                       city : 'London',                            country : 'UK' },
  { airport_id : 'LHR', name : 'Heathrow Airport',                      city : 'London',                            country : 'UK' },
  { airport_id : 'MAD', name : 'Adolfo Suárez Madrid–Barajas Airport',  city : 'Madrid',                            country : 'ES' },
  { airport_id : 'VKO', name : 'Vnukovo International Airport',         city : 'Moscow',                            country : 'RU' },
  { airport_id : 'SVO', name : 'Sheremetyevo International Airport',    city : 'Moscow',                            country : 'RU' },
  // America
  { airport_id : 'JFK', name : 'John F. Kennedy International Airport', city : 'New York City, New York',           country : 'US' },
  { airport_id : 'BNA', name : 'Nashville International Airport',       city : 'Nashville, Tennessee',              country : 'US' },
  { airport_id : 'BOS', name : 'Logan International Airport',           city : 'Boston, Massachusetts',             country : 'US' },
  { airport_id : 'ELP', name : 'El Paso International Airport',         city : 'El Paso, Texas',                    country : 'US' },
  { airport_id : 'DEN', name : 'Denver International Airport',          city : 'Denver, Colorado',                  country : 'US' },
  { airport_id : 'HOU', name : 'William P. Hobby Airport',              city : 'Houston, Texas',                    country : 'US' },
  { airport_id : 'LAS', name : 'McCarran International Airport',        city : 'Las Vegas, Nevada',                 country : 'US' },
  { airport_id : 'LAX', name : 'Los Angeles International Airport',     city : 'Los Angeles, California',           country : 'US' },
  { airport_id : 'MCI', name : 'Kansas City International Airport',     city : 'Kansas City, Missouri',             country : 'US' },
  { airport_id : 'MIA', name : 'Miami International Airport',           city : 'Miami, Florida',                    country : 'US' },
  { airport_id : 'SFO', name : 'San Francisco International Airport',   city : 'San Francisco, California',         country : 'US' },
  { airport_id : 'EWR', name : 'Newark Liberty International Airport',  city : 'Newark, New Jersey',                country : 'US' },
  { airport_id : 'YOW', name : 'Ottawa Macdonald–Cartier Int. Airport', city : 'Ottawa, Ontario',                   country : 'CA' },
  { airport_id : 'ACA', name : 'General Juan N. Álvarez Int. Airport',  city : 'Acapulco, Guerrero',                country : 'MX' },
  { airport_id : 'GIG', name : 'Rio de Janeiro–Galeão Int. Airport',    city : 'Rio de Janeiro',                    country : 'BR' },
  { airport_id : 'HAV', name : 'José Martí International Airport',      city : 'Havana',                            country : 'CU' },
  // Australia
  { airport_id : 'ASP', name : 'Alice Springs Airport',                 city : 'Alice Springs, Northern Territory', country : 'AU' },
  // Africa
  { airport_id : 'ACE', name : 'Lanzarote Airport',                     city : 'Lanzarote, Canary Islands',         country : 'ES' },
  { airport_id : 'HRE', name : 'Harare International Airport',          city : 'Harare',                            country : 'ZW' },
  { airport_id : 'GCJ', name : 'Grand Central Airport',                 city : 'Johannesburg',                      country : 'SA' },
  // Asia
  { airport_id : 'NRT', name : 'Narita International Airport',          city : 'Tokyo, Honshu',                     country : 'JP' },
  { airport_id : 'ITM', name : 'Osaka International Airport',           city : 'Osaka, Honshu',                     country : 'JP' },
  { airport_id : 'KIX', name : 'Kansai International Airport',          city : 'Osaka, Honshu',                     country : 'JP' },
  { airport_id : 'HIJ', name : 'Hiroshima Airport',                     city : 'Hiroshima, Honshu',                 country : 'JP' },
  { airport_id : 'SIN', name : 'Singapore Changi Airport',              city : 'Singapore',                         country : 'SG' },
  { airport_id : 'KUL', name : 'Kuala Lumpur International Airport',    city : 'Kuala Lumpur',                      country : 'MY' },
  { airport_id : 'HKG', name : 'Hong Kong International Airport',       city : 'Hongkong',                          country : 'CN' },
  { airport_id : 'BKK', name : 'Suvarnabhumi Airport',                  city : 'Bangkok',                           country : 'TH' }
];
// TODO AT, CH, NL, IT, UK, ES, RU, MX, BR, CU, ZW, SA, JP, SG, MY, TH missing in table of countries

const firstNames = [
  { first_name : 'Simon', gender : 'M'},
  { first_name : 'Harish', gender : 'M'},
  { first_name : 'Volker', gender : 'M'},
  { first_name : 'Jasmin', gender : 'F'},
  { first_name : 'Felix', gender : 'M'},
  { first_name : 'Kristina', gender : 'F'},
  { first_name : 'Thilo', gender : 'M'},
  { first_name : 'Andrej', gender : 'M'},
  { first_name : 'Anna', gender : 'F'},
  { first_name : 'Johannes', gender : 'M'},
  { first_name : 'Johann', gender : 'M'},
  { first_name : 'Christoph', gender : 'M'},
  { first_name : 'Andreas', gender : 'M'},
  { first_name : 'Stephen', gender : 'M'},
  { first_name : 'Mathilde', gender : 'F'},
  { first_name : 'August', gender : 'M'},
  { first_name : 'Illya', gender : 'M'},
  { first_name : 'Georg', gender : 'M'},
  { first_name : 'Gisela', gender : 'F'},
  { first_name : 'Christa', gender : 'F'},
  { first_name : 'Holm', gender : 'M'},
  { first_name : 'Irmtraut', gender : 'F'},
  { first_name : 'Ludwig', gender : 'M'},
  { first_name : 'Laura', gender : 'F'},
  { first_name : 'Kurt', gender : 'M'},
  { first_name : 'Guenther', gender : 'M'},
  { first_name : 'Horst', gender : 'M'},
  { first_name : 'Matthias', gender : 'M'},
  { first_name : 'Amelie', gender : 'F'},
  { first_name : 'Walter', gender : 'M'},
  { first_name : 'Sophie', gender : 'F'},
  { first_name : 'Claire', gender : 'F'},
  { first_name : 'Chantal', gender : 'F'},
  { first_name : 'Jean', gender : 'M'},
  { first_name : 'Cindy', gender : 'F'},
  { first_name : 'Pierre', gender : 'M'},
  { first_name : 'Irene', gender : 'F'},
  { first_name : 'Adam', gender : 'M'},
  { first_name : 'Fabio', gender : 'M'},
  { first_name : 'Lothar', gender : 'M'},
  { first_name : 'Annemarie', gender : 'F'},
  { first_name : 'Ida', gender : 'F'},
  { first_name : 'Roland', gender : 'M'},
  { first_name : 'Achim', gender : 'M'},
  { first_name : 'Allen', gender : 'M'},
  { first_name : 'Lee', gender : 'M'},
  { first_name : 'Guillermo', gender : 'M'},
  { first_name : 'Florian', gender : 'M'},
  { first_name : 'Ulla', gender : 'F'},
  { first_name : 'Juan', gender : 'M'},
  { first_name : 'Marta', gender : 'F'},
  { first_name : 'Salvador', gender : 'M'},
  { first_name : 'Christine', gender : 'F'},
  { first_name : 'Dominik', gender : 'M'},
  { first_name : 'Astrid', gender : 'F'},
  { first_name : 'Ruth', gender : 'F'},
  { first_name : 'Theresia', gender : 'F'},
  { first_name : 'Thomas', gender : 'M'},
  { first_name : 'Friedrich', gender : 'M'},
  { first_name : 'Anneliese', gender : 'F'},
  { first_name : 'Peter', gender : 'M'},
  { first_name : 'Anne-Marie', gender : 'F'},
  { first_name : 'James', gender : 'M'},
  { first_name : 'Jean-Luc', gender : 'M'},
  { first_name : 'Benjamin', gender : 'M'},
  { first_name : 'Hendrik', gender : 'M'},
  { first_name : 'Uli', gender : 'F'},
  { first_name : 'Siegfried', gender : 'M'},
  { first_name : 'Max', gender : 'M'}
];

const lastNames = [
  { last_name : 'Buchholm'},
  { last_name : 'Vrsic'},
  { last_name : 'Jeremias'},
  { last_name : 'Gutenberg'},
  { last_name : 'Fischmann'},
  { last_name : 'Columbo'},
  { last_name : 'Neubasler'},
  { last_name : 'Martin'},
  { last_name : 'Detemple'},
  { last_name : 'Barth'},
  { last_name : 'Benz'},
  { last_name : 'Hansmann'},
  { last_name : 'Koslowski'},
  { last_name : 'Wohl'},
  { last_name : 'Koller'},
  { last_name : 'Hoffen'},
  { last_name : 'Dumbach'},
  { last_name : 'Goelke'},
  { last_name : 'Waldmann'},
  { last_name : 'Mechler'},
  { last_name : 'Buehler'},
  { last_name : 'Heller'},
  { last_name : 'Simonen'},
  { last_name : 'Henry'},
  { last_name : 'Marshall'},
  { last_name : 'Legrand'},
  { last_name : 'Jacqmain'},
  { last_name : 'D´Oultrement'},
  { last_name : 'Hunter'},
  { last_name : 'Delon'},
  { last_name : 'Kreiss'},
  { last_name : 'Trensch'},
  { last_name : 'Cesari'},
  { last_name : 'Matthaeus'},
  { last_name : 'Babilon'},
  { last_name : 'Zimmermann'},
  { last_name : 'Kramer'},
  { last_name : 'Illner'},
  { last_name : 'Pratt'},
  { last_name : 'Gahl'},
  { last_name : 'Benjamin'},
  { last_name : 'Miguel'},
  { last_name : 'Weiss'},
  { last_name : 'Sessler'},
  { last_name : 'Montero'},
  { last_name : 'Domenech'},
  { last_name : 'Moyano'},
  { last_name : 'Sommer'},
  { last_name : 'Schneider'},
  { last_name : 'Eichbaum'},
  { last_name : 'Gueldenpfennig'},
  { last_name : 'Sudhoff'},
  { last_name : 'Lautenbach'},
  { last_name : 'Ryan'},
  { last_name : 'Prinz'},
  { last_name : 'Deichgraeber'},
  { last_name : 'Pan'},
  { last_name : 'Lindwurm'},
  { last_name : 'Kirk'},
  { last_name : 'Picard'},
  { last_name : 'Sisko'},
  { last_name : 'Madeira'},
  { last_name : 'Meier'},
  { last_name : 'Rahn'},
  { last_name : 'Leisert'},
  { last_name : 'Müller'},
  { last_name : 'Mustermann'},
  { last_name : 'Becker'},
  { last_name : 'Fischer'}
];

const connections = [
  // ! weekday here 1=Mon..7=Sun !
  { carrier_id : 'SW', connection_id : '0001', airport_from_id : 'SFO', airport_to_id : 'SIN', departure_time : '011500', arrival_time : '115000', distance : 13523, distance_unit : 'KM', weekday : 3 },
  { carrier_id : 'SW', connection_id : '0002', airport_from_id : 'SIN', airport_to_id : 'SFO', departure_time : '063000', arrival_time : '091500', distance : 13523, distance_unit : 'KM', weekday : 4 },
  { carrier_id : 'SW', connection_id : '0011', airport_from_id : 'NRT', airport_to_id : 'SIN', departure_time : '145500', arrival_time : '205000', distance :  5363, distance_unit : 'KM', weekday : 4 },
  { carrier_id : 'SW', connection_id : '0012', airport_from_id : 'SIN', airport_to_id : 'NRT', departure_time : '095300', arrival_time : '175400', distance :  5363, distance_unit : 'KM', weekday : 6 },
  { carrier_id : 'SW', connection_id : '0058', airport_from_id : 'SFO', airport_to_id : 'FRA', departure_time : '134500', arrival_time : '095500', distance :  9608, distance_unit : 'KM', weekday : 1 },
  { carrier_id : 'SW', connection_id : '0059', airport_from_id : 'FRA', airport_to_id : 'SFO', departure_time : '135500', arrival_time : '163000', distance :  9608, distance_unit : 'KM', weekday : 2 },
  { carrier_id : 'SW', connection_id : '1537', airport_from_id : 'EWR', airport_to_id : 'MIA', departure_time : '215600', arrival_time : '004700', distance :  1752, distance_unit : 'KM', weekday : 5 },
  { carrier_id : 'GA', connection_id : '0322', airport_from_id : 'MIA', airport_to_id : 'EWR', departure_time : '201700', arrival_time : '231900', distance :  1752, distance_unit : 'KM', weekday : 7 },
  { carrier_id : 'GA', connection_id : '0017', airport_from_id : 'MIA', airport_to_id : 'HAV', departure_time : '071900', arrival_time : '080300', distance :   520, distance_unit : 'KM', weekday : 3 },
  { carrier_id : 'GA', connection_id : '2678', airport_from_id : 'HAV', airport_to_id : 'MIA', departure_time : '061500', arrival_time : '103000', distance :   520, distance_unit : 'KM', weekday : 6 },
  { carrier_id : 'GA', connection_id : '0015', airport_from_id : 'JFK', airport_to_id : 'SFO', departure_time : '071300', arrival_time : '100400', distance :  4156, distance_unit : 'KM', weekday : 5 },
  { carrier_id : 'GA', connection_id : '0018', airport_from_id : 'SFO', airport_to_id : 'JFK', departure_time : '064000', arrival_time : '150600', distance :  4156, distance_unit : 'KM', weekday : 4 },
  { carrier_id : 'EA', connection_id : '0400', airport_from_id : 'FRA', airport_to_id : 'JFK', departure_time : '101000', arrival_time : '113400', distance :  6162, distance_unit : 'KM', weekday : 6 },
  { carrier_id : 'EA', connection_id : '0401', airport_from_id : 'JFK', airport_to_id : 'FRA', departure_time : '183000', arrival_time : '074500', distance :  6162, distance_unit : 'KM', weekday : 5 },
  { carrier_id : 'EA', connection_id : '0402', airport_from_id : 'FRA', airport_to_id : 'EWR', departure_time : '133000', arrival_time : '153500', distance :  6217, distance_unit : 'KM', weekday : 1 },
  { carrier_id : 'EA', connection_id : '0403', airport_from_id : 'EWR', airport_to_id : 'FRA', departure_time : '180900', arrival_time : '073000', distance :  6217, distance_unit : 'KM', weekday : 1 },
  { carrier_id : 'OC', connection_id : '0407', airport_from_id : 'NRT', airport_to_id : 'FRA', departure_time : '132300', arrival_time : '155600', distance :  9379, distance_unit : 'KM', weekday : 5 },
  { carrier_id : 'OC', connection_id : '0408', airport_from_id : 'FRA', airport_to_id : 'NRT', departure_time : '202500', arrival_time : '154000', distance :  9379, distance_unit : 'KM', weekday : 6 },
  { carrier_id : 'FA', connection_id : '0788', airport_from_id : 'VCE', airport_to_id : 'NRT', departure_time : '132500', arrival_time : '101300', distance :  9595, distance_unit : 'KM', weekday : 6 },
  { carrier_id : 'FA', connection_id : '0789', airport_from_id : 'NRT', airport_to_id : 'VCE', departure_time : '142600', arrival_time : '213100', distance :  9595, distance_unit : 'KM', weekday : 5 }
];

const carriers = [
  { carrier_id : 'GA', name : 'Green Albatros',    currency_code : 'CAD' },
  { carrier_id : 'FA', name : 'Fly Africa',        currency_code : 'ZAR' },
  { carrier_id : 'EA', name : 'European Airlines', currency_code : 'EUR' },
  { carrier_id : 'OC', name : 'Oceania',           currency_code : 'USD' },
  { carrier_id : 'SW', name : 'Sunset Wings',      currency_code : 'USD' }
];

const plane_types = {
  short_distance: [
    { id : 'A320-200', seats_max : 130},
    { id : 'A321-200', seats_max : 150},
    { id : '737-800' , seats_max : 140},
    { id : 'A319-100', seats_max : 120}
  ],
  long_distance: [
    { id : '747-400' , seats_max : 385},
    { id : '767-200' , seats_max : 260},
    { id : 'A340-600', seats_max : 330},
    { id : 'A380-800', seats_max : 475}
  ]
};




// parameters to influence data generation:

// number of days between flights of a connection, usually set to a multiple of 7
// this is the main parameter to control size of traves/bookings/bookingSupplements
// roughly:
// interval | #travels | #bookings | #bookingSupplements
// ---------+----------+-----------+--------------------
//      300 |    3.000 |     9.000 |              16.000
//       56 |    9.500 |    31.000 |              55.000
//       28 |   19.000 |    61.000 |             110.000
//       14 |   36.000 |   120.000 |             210.000
//        7 |   71.000 |   230.000 |             410.000






function getGenerator() {
  var seed = 6;
  const ran = {
    bookingDateOffset: function() {return random(0, 20)},
    travelChangeDate : function() {return random(0, 20)},
    tripLength       : function() {return random(1, 5)},
    groupSize        : function() {return random(1, 3)},
    supplementCount  : function() {return random(0, 5)},
    entryOf          : function(a) {return a[random(0, a.length-1)];}
  }

  let makeUUID = makeRealUUID;
  //let makeUUID = pseudoUuid;

  let flights  = [];
  let travelId = 1;
  makeFlights();

  return {
    getFlights: (function() {
      return flights;
    }),
    getTravels: (function(count) {
      let travels = [];
      let t = makeTravel();
      while (t) {
        travels.push(t);
        if (count && travels.length>=count) break;
        t = makeTravel();
      }
      return travels;
    })
  };

  // ------------------------------------------------------------------------------------------------------------------
  // Random numbers
  // ------------------------------------------------------------------------------------------------------------------

  // random integer number between min (incl.) and max (incl).
  function random(min, max) {
    //var rnd = Math.random();

    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280;

    return Math.floor(rnd * (max+1 - min)) + min;
  }

  function pseudoUuid() {
    let s = '';
    for (let i=0; i<16; ++i) {
      s += random(0, 255).toString(16);
    }
    return s;
  }
  
  // ------------------------------------------------------------------------------------------------------------------
  // Flights
  // ------------------------------------------------------------------------------------------------------------------

  function makeFlights() {
    for (let conn of connections) {
      let dates = getFlightDates(conn);
      for (let d of dates) {
        let flight_info = flightInfo(conn);  // uses random
        let [carrier] = carriers.filter(x => x.carrier_id == conn.carrier_id);
        flights.push({
          carrier_id:    conn.carrier_id,
          connection_id: conn.connection_id,
          distance: conn.distance,
          flight_date: d,
          currency_code: carrier ? carrier.currency_code : 'EUR',
          price:          flight_info.price,
          plane_type_id:  flight_info.id,
          seats_max:      flight_info.seats_max,
          seats_occupied: flight_info.seats_occ,
          seats_to_book:  flight_info.seats_occ  // will be changed during generation of bookings
        });
      }
    }
    flights.sort(byDate);

    function byDate(a, b) {
      if (a.flight_date < b.flight_date) { return -1; }
      if (a.flight_date > b.flight_date) { return 1; }
      return 0;
    }  
  }

  // Returns an array of dates, at which the connection is operated.
  // In contrast to real flight plans, here each connection is only operated on a certain weekday.
  // Generation logic: 
  //   if the connection operates on a Wednesday, then the first date is the Wednesday 31 weeks from now
  //   then subtract "flightInterval" days
  function getFlightDates(connection) {
    // getDate() : integer 1..31, day of month
    // getDay()  : integer 0..6 = Sunday..Saturday
    // "add days": make sure to call getDate() and setDate() on the same object!

    const flightInterval = 43;         // ABAP: 1, 2, 4, 8, 43
    const back = 21;
    const forw = 31;

    var nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
    var minDate = new Date(nextMonday);
    minDate.setDate(minDate.getDate() - (back*7+1) );  // is a Sunday           21
    var maxDate = new Date(nextMonday);
    maxDate.setDate(maxDate.getDate() + forw*7);  // is a Monday                31

    var flightdate = new Date(maxDate);
    flightdate.setDate(flightdate.getDate() + connection.weekday - 1) // -1 because Monday=1 in connection table

    var dates = [];
    while (flightdate>minDate) {
      dates.push(flightdate.toISOString().slice(0,10));
      flightdate.setDate(flightdate.getDate() - flightInterval*7)
    }
    return dates;
  }

  function flightInfo(conn) {
    // get a suitable plane type
    let planes = (conn.distance > 3000) ? plane_types.long_distance : plane_types.short_distance;
    let plane = ran.entryOf(planes);
    let seatsOccPerc = random(70-25, 70+25);
    return {
      id: plane.id,
      seats_max: plane.seats_max,
      seats_occ: Math.floor(plane.seats_max * seatsOccPerc / 100),
      price: flightPrice(seatsOccPerc, conn.distance)
    }
  }

  function flightPrice(seatsOccPerc, distance) {
    var p = 25 + ( 3 * Math.pow(seatsOccPerc, 2) / 400 );
    var price = Math.floor( p * distance / 100 );
    return price;
  }


  // ------------------------------------------------------------------------------------------------------------------
  // Travels
  // ------------------------------------------------------------------------------------------------------------------

  function makeTravel() {
    var travel = null;

    var travelUuid = makeUUID();
    //var travelUuid = travelId;

    var bookings = makeBookings(travelId, travelUuid);
    if (bookings.length > 0) {
      // travel create day is 15 days before today or first flight booking (whatever comes first)
      // createdAt:     travelCreateDay + random time
      // lastChangedAt: travelCreateDay + ran.travelChangeDate + random time
      // both have format 2020-11-10T03:54:50Z
      var bookingDate = new Date(bookings[0].bookingDate);
      var today = new Date();
      var travelCreateDay = (bookingDate < today) ? bookingDate : today;
      travelCreateDay.setDate(travelCreateDay.getDate() - 15);
      var createdAt = new Date(travelCreateDay);
      createdAt.setSeconds(random(0, 24*60*60-1));
      createdAt = createdAt.toISOString().slice(0, 19)+'Z';
      var lastChangedAt = new Date(travelCreateDay);
      lastChangedAt.setDate(lastChangedAt.getDate() + ran.travelChangeDate());
      lastChangedAt.setSeconds(random(0, 24*60*60-1));
      lastChangedAt = lastChangedAt.toISOString().slice(0, 19)+'Z';

      // var createdAt = 0; //new Date(travelCreateDay);
      // var lastChangedAt = 0; //new Date(travelCreateDay);

      var travelStatus = ran.entryOf(['O', 'O', 'O', 'A', 'A', 'X' ]);
      var bookingStatus = (travelStatus == 'A') ? 'B' : (travelStatus == 'O') ? 'N' : 'X';

      for (let b of bookings) {
        b.booking_status = bookingStatus;
        b.lastChangedAt = lastChangedAt;
        for (let s of b.booking_supplements) {
          s.lastChangedAt = lastChangedAt;
        }
      }

      travel = {
        travelUuid: travelUuid,
        travelId: travelId,
        agency_id: ran.entryOf(agencies).agency_id,
        customer_id: (random(1, 4) == 1) ? ran.entryOf(passengers).customer_id : bookings[0].customer_id,
        begin_date: bookings[0].flight_date,
        end_date: bookings[bookings.length-1].flight_date,
        booking_fee: 10 * bookings.length,
        total_price: 10 * bookings.length + bookings.reduce((sum,book) => sum+book.flight_price+book.booking_supplements.reduce((sum,suppl) => sum+suppl.price, 0), 0),
        currency_code: bookings[0].currency_code,
        description: getDescription(bookings),
        status: travelStatus,
        createdBy: ran.entryOf(lastNames).last_name,
        createdat: createdAt,
        lastchangedby: ran.entryOf(lastNames).last_name,
        lastchangedat: lastChangedAt,
        bookings: bookings
      };
      travelId++;
    }
    return travel;
  }

  function getDescription(bookings) {
    var c = random(0, 9);
    switch (c) {
      case 1:
      case 2:
        var custSet = new Set(bookings.map(x => x.customer_id));
        var pass = [...custSet].map(x => passengers.find(y => y.customer_id == x).first_name);
        return (c==1 ? 'Business Trip' : 'Vacation') + ' for ' + pass.join(', ');
      case 3:
      case 4: 
        var conn = connections.find(x => x.carrier_id == bookings[0].carrier_id && x.connection_id == bookings[0].connection_id);
        var airport = airports.find(x => x.airport_id == conn.airport_to_id);
        var country = countries.find(x => x.code == airport.country);
        return (c==3 ? 'Business Trip' : 'Vacation') + ' to ' + (country ? country.name : 'Mars');
      case 5:
        conn = connections.find(x => x.carrier_id == bookings[0].carrier_id && x.connection_id == bookings[0].connection_id);
        airport = airports.find(x => x.airport_id == conn.airport_to_id);
        return 'Vacation to ' + airport.city;
      default:
        return 'Vacation';
    };
  }


  // ------------------------------------------------------------------------------------------------------------------
  // Bookings + BookingSupplements
  // ------------------------------------------------------------------------------------------------------------------

  function makeBookings(travelId, travelUuid) {
    // helper to add number of days to a dateString like '2021-04-19'
    function addDays(dateString, days) {
      var date = new Date(dateString);
      date.setDate(date.getDate() + days);
      return date.toISOString().slice(0,10);
    }

    function findSuitableFlight(seatsRequired, prevFlight) {
      // suitable: - seats_to_book >= seatsRequired
      //           - if prevFlight is set: departure airport = destination airport of prevFlight
      var suitableFlights = flights.filter(x => x.seats_to_book >= seatsRequired);
      if (prevFlight) {
        var prevConn = connections.find(x => x.carrier_id == prevFlight.carrier_id && x.connection_id == prevFlight.connection_id);
        if (!prevConn) return null;
        var conn = connections.find(x => x.airport_from_id == prevConn.airport_to_id);
        if (!conn) return null;
        suitableFlights = suitableFlights.filter(x => x.connection_id == conn.connection_id && x.flight_date >= prevFlight.flight_date);
      }
      return suitableFlights[0];
    }
    // function findSuitableFlight(seatsRequired, prevFlight) {
    //   var suitableFlights = flights.filter(x => x.seats_to_book >= seatsRequired);
    //   return ran.entryOf(suitableFlights);
    // }

    var groupSize = ran.groupSize();
    var tripLength = ran.tripLength();
    
    var group = new Set();  // avoid duplicates
    while (group.size < groupSize) {
      group.add(ran.entryOf(passengers).customer_id);
    }

    let bookings = [];
    var bookingId = 0;

    var flight = findSuitableFlight(groupSize);
    for (let c=0; c<tripLength && flight; c++) {
      var bookingDate = addDays(flight.flight_date, -ran.bookingDateOffset());
      var seatsOccPerc = (flight.seats_occupied - flight.seats_to_book) * 100 / flight.seats_max;
      var price = flightPrice(seatsOccPerc, flight.distance);
    
      flight.seats_to_book -= groupSize;
      if (flight.seats_to_book < 0) flight.seats_to_book = 0;

      for (let custId of [...group]) {
        bookingId++;

        var bookingUuid = makeUUID();
        //var bookingUuid = bookingId;

        bookings.push({
          travelId: travelId,
          travelUuid: travelUuid,
          bookingId: bookingId,
          bookingUuid: bookingUuid,
          bookingDate: bookingDate,
          customer_id: custId,
          carrier_id: flight.carrier_id,
          connection_id: flight.connection_id,
          flight_date: flight.flight_date,
          flight_price: price,
          currency_code: flight.currency_code,
          booking_supplements: bookingSupplements(travelId, bookingId, travelUuid, bookingUuid)
        });
      }
      flight = findSuitableFlight(groupSize, flight);
    }

    return bookings;
  }

  function bookingSupplements(travelId, bookingId, travelUuid, bookingUuid) {
    var bookingSupplements = [];
    var sc = ran.supplementCount();
    for (let i=1; i<=sc; i++) {
      var suppl = ran.entryOf(supplements);
      bookingSupplements.push({
        travelId: travelId,
        travelUuid: travelUuid,
        bookingId: bookingId,
        bookingUuid: bookingUuid,
        booking_supplement_id: i,

        booking_supplement_uuid: makeUUID(),
        //booking_supplement_uuid: i,

        supplement_id: suppl.supplement_id,
        price: parseFloat(suppl.price),
        currency_code: suppl.currency_code
      });
    }
    return bookingSupplements;
  }
}

//---------------------------------------------------------------------------------------------------------------------
//
// main
//
//---------------------------------------------------------------------------------------------------------------------



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
    t.createdat,
    t.lastchangedby,
    t.lastchangedat
  ].join(';');
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



function renderFlights(flights) {
  var af = flights.map(x => flightToString(x)).sort();
  af.unshift(hf);
  var sf = af.join(EOL);
  return sf;
}

function renderTravels(travels) {
  var at = [ht];
  var ab = [hb];
  var as = [hs];
  for (let t of travels) {
    at.push(travelToString(t));
    for (let b of t.bookings) {
      ab.push(bookingToString(b));
      for (let s of b.booking_supplements) {
        as.push(bookingSupplementToString(s));
      }
    }
  }
  var st = at.join(EOL);
  var sb = ab.join(EOL);
  var ss = as.join(EOL);
  return {st, sb, ss};
}



function clock() {
  let dursum = 0;
  function pass(index) {
    let generator = getGenerator();
    let flights = generator.getFlights();
  
    let start = Date.now();
    let travels = generator.getTravels();
    let millis = Date.now() - start;
    dursum += millis/1000;
    console.log("pass", index+1, ", duration:", millis/1000, "s");
  
    let countTravels = travels.length;
    let countBookings = travels.reduce((a,c) => a + c.bookings.length, 0);
    let countBookingSupplements = travels.reduce((a,c) => a + c.bookings.reduce((a,c) => a + c.booking_supplements.length, 0), 0);
    let f_book = Math.round(countBookings/countTravels*100)/100;
    let f_supp = Math.round(countBookingSupplements/countBookings*100)/100;
    console.log(flights.length, countTravels, f_book, countBookings, f_supp, countBookingSupplements)

    flights = null;
    travels = null;
    generator = null;
  }

  const repeats = 10;
  for (let i=0; i<repeats; i++) {
    pass(i);
  }

  console.log("\naverage duration:", dursum/repeats);
}







var generator = getGenerator();
var flights = generator.getFlights();
var travels = generator.getTravels();

var countTravels = travels.length;
var countBookings = travels.reduce((a,c) => a + c.bookings.length, 0);
var countBookingSupplements = travels.reduce((a,c) => a + c.bookings.reduce((a,c) => a + c.booking_supplements.length, 0), 0);
var f_book = Math.round(countBookings/countTravels*100)/100;
var f_supp = Math.round(countBookingSupplements/countBookings*100)/100;

console.log(flights.length, countTravels, f_book, countBookings, f_supp, countBookingSupplements)

//console.log(JSON.stringify(travels,null,2));


let sf = renderFlights(flights);
// console.log(sf);
// console.log();

let {st, sb, ss} = renderTravels(travels);

//console.log(st);
// console.log();
// console.log(sb);
// console.log();
// console.log(ss);

fs.writeFileSync("./output/sap.fe.cap.travel-Flight.csv", sf);
fs.writeFileSync("./output/sap.fe.cap.travel-Travel.csv", st);
fs.writeFileSync("./output/sap.fe.cap.travel-Booking.csv", sb);
fs.writeFileSync("./output/sap.fe.cap.travel-BookingSupplement.csv", ss);








