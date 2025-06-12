const cds = require('@sap/cds')
module.exports = class TravelService extends cds.ApplicationService { init() {

  // Reflected definitions from the service's CDS model
  const { Travel, Booking, BookingSupplement: Supplements } = this.entities
  const { Open='O', Accepted='A', Canceled='X' } = {}

  // Fill in alternative keys as consecutive numbers for new Travels, Bookings, and Supplements.
  // Note: For Travels that can't be done at NEW events, that is when drafts are created,
  // but on CREATE only, as multiple users could create new Travels concurrently.
  this.before ('CREATE', Travel, async req => {
    let { maxID } = await SELECT.one (`max(TravelID) as maxID`) .from (Travel)
    req.data.TravelID = ++maxID
  })

  // Prevent changing closed travels -> should be automated by Status-Transition Flows
  this.before ('NEW', Booking.drafts, async req => {
    let { status } = await SELECT `TravelStatus_code as status` .from (Travel.drafts, req.data.to_Travel_TravelUUID)
    if (status === Canceled) return req.reject (400, 'Cannot add new bookings to rejected travels.')
  })

  // Fill in IDs as sequence numbers -> could be automated by auto-generation
  this.before ('NEW', Booking.drafts, async req => {
    let { maxID } = await SELECT.one (`max(BookingID) as maxID`) .from (Booking.drafts) .where (req.data)
    req.data.BookingID = ++maxID
  })

  // Fill in IDs as sequence numbers -> should be automated by auto-generation
  this.before ('NEW', Supplements.drafts, async req => {
    let { maxID } = await SELECT.one (`max(BookingSupplementID) as maxID`) .from (Supplements.drafts) .where (req.data)
    req.data.BookingSupplementID = ++maxID
  })

  // Ensure BeginDate is not after EndDate -> would be automated by Dynamic Validations
  this.before ('SAVE', Travel, req => { // REVISIT: should also work for Travel.drafts instead of Travel, but doesn't (?)
    const { BeginDate, EndDate } = req.data
    if (BeginDate > EndDate) req.error (400, `End Date must be after Begin Date.`, 'in/EndDate') // REVISIT: in/ should go away!
  })


  // Update a Travel's TotalPrice whenever its BookingFee is modified,
  // or when a nested Booking is deleted or its FlightPrice is modified,
  // or when a nested Supplement is deleted or its Price is modified.
  // -> should be automated by Calculated Elements + auto-GROUP BY
  this.on ('PATCH', Travel.drafts,      (req, next) => update_totals (req, next, 'BookingFee', 'GoGreen'))
  this.on ('PATCH', Booking.drafts,     (req, next) => update_totals (req, next, 'FlightPrice'))
  this.on ('PATCH', Supplements.drafts, (req, next) => update_totals (req, next, 'Price'))
  this.on ('DELETE', Booking.drafts,     (req, next) => update_totals (req, next))
  this.on ('DELETE', Supplements.drafts, (req, next) => update_totals (req, next))
  // Note: Using .on handlers as we need to read a Booking's or Supplement's TravelUUID before they are deleted.
  async function update_totals (req, next, ...fields) {
    if (fields.length && !fields.some(f => f in req.data)) return next() //> skip if no relevant data changed
    const travel = req.data.TravelUUID || ( await SELECT.one `to_Travel.TravelUUID as id` .from (req.subject) ).id
    await next() // actually UPDATE or DELETE the subject entity
    await update_totalsGreen(travel)
    await cds.run(`UPDATE ${Travel.drafts} SET TotalPrice = coalesce (BookingFee,0) + coalesce(GreenFee,0)
     + ( SELECT coalesce (sum(FlightPrice),0) from ${Booking.drafts} where to_Travel_TravelUUID = TravelUUID )
     + ( SELECT coalesce (sum(Price),0) from ${Supplements.drafts} where to_Travel_TravelUUID = TravelUUID )
    WHERE TravelUUID = ?`, [travel])
  }

  /**
   * Trees-for-Tickets: helper to update totals including green flight fee
   */
  async function update_totalsGreen(TravelUUID) {
    const { GoGreen, BookingFee } = await SELECT.one .from(Travel.drafts) .columns('GoGreen') .where({ TravelUUID })
      await UPDATE(Travel.drafts, TravelUUID) .with ( GoGreen ? {
        GreenFee: Math.round (BookingFee * 0.1, 0),
        TreesPlanted: Math.round (BookingFee * 0.1, 0) // looks wrong
      } : {
        GreenFee: 0,
        TreesPlanted: 0
      })
  }


  //
  // Action Implementations...
  //

  const { acceptTravel, rejectTravel, deductDiscount } = Travel.actions

  this.on (acceptTravel, async req => UPDATE (req.subject) .with ({ TravelStatus_code: Accepted }))
  this.on (rejectTravel, async req => UPDATE (req.subject) .with ({ TravelStatus_code: Canceled }))
  this.on (deductDiscount, async req => {
    let discount = req.data.percent / 100
    let succeeded = await UPDATE (req.subject) .where ({ TravelStatus_code: Open, BookingFee: { 'is not': null } })
      .with `TotalPrice = round (TotalPrice - TotalPrice * ${discount}, 3)`
      .with `BookingFee = round (BookingFee - BookingFee * ${discount}, 3)`

    if (!succeeded) { //> let's find out why...
      let travel = await SELECT.one `TravelID as ID, TravelStatus.code as status, BookingFee` .from (req.subject)
      if (!travel) throw req.reject (404, `Travel "${travel.ID}" does not exist; may have been deleted meanwhile.`)
      if (travel.status === Accepted) throw req.reject (409, `Travel "${travel.ID}" has been approved already.`)
      if (travel.BookingFee == null) throw req.reject (404, `No discount possible, "${travel.ID}" does not yet have a booking fee added.`)
    } else {
      return SELECT(req.subject)
    }
  })

  // Add base class's handlers. Handlers registered above go first.
  return super.init()

}}
