using { sap.fe.cap.travel as my } from '../db/schema';

@microflow service TravelFlow {
  entity Travel as projection on my.Travel {
    key TravelID,
    TravelStatus.code as status
  } actions {
    action new     @(                                    to: Draft ) ();
    action edit    @( from:[ Open, Approved, Rejected ], to: Draft ) ();
    action save    @( from:[ Draft ],                    to: Open ) ();
    action approve @( from:[ Open ],                     to: Approved ) ();
    action cancel  @( from:[ Open, Approved ],           to: Cancelled ) ();
    action reject  @( from:[ Open ],                     to: Rejected ) ();
  };
}
