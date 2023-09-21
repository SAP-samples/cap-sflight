using { sap.fe.cap.travel as my } from '../db/schema';

@path: '/flights'
service FlightsService {

  @readonly
  entity Flights as projection on my.Flight {
    *,

    @Common.Label: '{i18n>Flight}'
    AirlineID || ' ' || ConnectionID as FlightID : String,

    to_Connection.DepartureAirport.City || ' – ' || to_Connection.DestinationAirport.City as FromTo : String,

    @Common.Label: '{i18n>DepartureAirport}'
    @Common.Text: DepCity
    to_Connection.DepartureAirport.AirportID as DepAirport,
    to_Connection.DepartureAirport.City      as DepCity,

    @Common.Label: '{i18n>ArrivalAirport}'
    @Common.Text: DestCity
    to_Connection.DestinationAirport.AirportID as DestAirport,
    to_Connection.DestinationAirport.City      as DestCity,

    (MaximumSeats-OccupiedSeats <=0 ? 1 :
      (MaximumSeats-OccupiedSeats <=10 ? 2
    : 0)
    ) as OccupiedCriticality:Integer

  };

}