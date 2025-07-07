# reCAP

This is the README for the talk "Enhance CAP Apps with Central
Authorization Policies" of [reCAP](https://recap-conf.dev/program.html).

In this talk, we show how IAS/AMS can be integrated into your CAP application.

## Starting Point

We have SFlight, a CAP Java application, which uses roles for authorization.
There are two relevant roles:

- __Planner__: Can _create_ or _discount_ any travel request
- __Reviewer__: Can _approve_ or _reject_ any travel request 

Any authenticated user can read all travels.

## Using AMS

We add AMS support via `cds add ams` and adapt SFlight for it.

Since AMS does not only support basic roles, but also attributes,
we can use them to define _policies_ that match our desired mock user
setup:

- __Uma__: User without any policies (_unauthorized_)
- __Paula__:
  - (Step 1) Planner for _all_ agencies
  - (Step 2) Planner for a few agencies in _Europe_
- __Richard__: 
  - (Step 1) Reviewer for all travels, regardless of _budget_
  - (Step 2) Junior reviewer for budgets < 1000 USD


## Links

- [Base URL](http://localhost:4004/travel_processor/dist/index.html)


## Differences to SFlight

- We use USD for all examples to simplify the "Reviewer" policy.
