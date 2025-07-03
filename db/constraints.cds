using {sap.fe.cap.travel as my} from './schema';

annotate my.Travel with @assert.constraint.beginBeforeEndDate: {
    condition : (BeginDate <= EndDate),
    message   : 'error.travel.date.before',
    parameters: [(TravelID), (BeginDate), (EndDate)],
    targets   : [(BeginDate), (EndDate)]
};

annotate my.Travel: BeginDate with @assert.constraint.beginDateMustBeInFuture: {
    condition : (BeginDate > CURRENT_DATE), // TODO: use `$now` once implemented on the java side
    message   : 'error.travel.date.past',
    parameters: [(TravelID), (BeginDate)]
};

annotate my.Booking: FlightDate with @assert.constraint.flightDate: {
    condition : (FlightDate between to_Travel.BeginDate and to_Travel.EndDate),
    message   : 'error.booking.flightDateNotInTravelPeriod',
    parameters: [(FlightDate), (to_Travel.BeginDate), (to_Travel.EndDate)]
};

annotate my.Booking: ConnectionID with @assert.constraint.freeseats: {
    condition : (to_Flight.OccupiedSeats < to_Flight.MaximumSeats),
    message   : 'No free seats on selected flight remaining.'
};
