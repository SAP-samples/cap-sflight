// Rich custom policies developed at runtime
// by customer.  ('local' package is never deployed)

POLICY TravelPlannerEU {
    USE cap.TravelPlanner RESTRICT
        AgencyLocation in ('DE', 'CH', 'IT'); // and more!
}

POLICY TravelReviewerJunior {
    USE cap.TravelReviewer RESTRICT
    Budget < 1000.0;
}
