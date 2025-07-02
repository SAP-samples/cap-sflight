// Base policies developed at design time
// by application developers.

POLICY TravelPlanner {
	ASSIGN ROLE Planner
		WHERE AgencyID       IS NOT RESTRICTED
		AND   AgencyLocation IS NOT RESTRICTED;
}

POLICY TravelReviewer {
	ASSIGN ROLE Reviewer
		WHERE AgencyID IS NOT RESTRICTED
		AND   Budget   IS NOT RESTRICTED;
}
