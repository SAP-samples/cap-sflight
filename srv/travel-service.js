const cds = require ('@sap/cds')

class TravelService extends cds.ApplicationService { init() {

  // Reflected definitions from the service's CDS model
  const { Travel, Booking, BookingSupplement: Supplements } = this.entities
  const { today } = cds.builtin.types.Date


  // Fill in alternative keys as consecutive numbers for new Travels, Bookings, and Supplements.
  // Note: For Travels that can't be done at NEW events, that is when drafts are created,
  // but on CREATE only, as multiple users could create new Travels concurrently.

  this.before ('CREATE', Travel, async req => {
    let { maxID } = await SELECT.one (`max(TravelID) as maxID`) .from (Travel)
    req.data.TravelID = ++maxID
  })

  this.before ('NEW', Booking.drafts, async req => {
    let { maxID } = await SELECT.one (`max(BookingID) as maxID`) .from (Booking.drafts) .where (req.data)
    req.data.BookingID = ++maxID
    req.data.BookingDate = today() // REVISIT: could that be filled in by CAP automatically?
  })

  this.before ('NEW', Supplements.drafts, async req => {
    let { maxID } = await SELECT.one (`max(BookingSupplementID) as maxID`) .from (Supplements.drafts) .where (req.data)
    req.data.BookingSupplementID = ++maxID
  })


  // Ensure BeginDate is not before today and not after EndDate.
  this.before ('SAVE', Travel, req => {
    const { BeginDate, EndDate } = req.data
    if (BeginDate < today()) req.error (400, `Begin Date must not be before today.`, 'in/BeginDate')
    if (BeginDate > EndDate) req.error (400, `End Date must be after Begin Date.`, 'in/EndDate')
  })


  // Update a Travel's TotalPrice whenever its BookingFee is modified,
  // or when a nested Booking is deleted or its FlightPrice is modified,
  // or when a nested Supplement is deleted or its Price is modified.

  this.on ('UPDATE', Travel.drafts,      (req, next) => update_totals (req, next, 'BookingFee'))
  this.on ('UPDATE', Booking.drafts,     (req, next) => update_totals (req, next, 'FlightPrice'))
  this.on ('UPDATE', Supplements.drafts, (req, next) => update_totals (req, next, 'Price'))
  this.on ('DELETE', Booking.drafts,     (req, next) => update_totals (req, next))
  this.on ('DELETE', Supplements.drafts, (req, next) => update_totals (req, next))

  // Note: using .on handlers as we need to read a Booking's or Supplement's TravelUUID before they are deleted.
  async function update_totals (req, next, field) {
    if (field && field in req.data === false) return next() //> skip if no relevant data changed
    const travel = req.data.TravelUUID || ( await SELECT.one `to_Travel.TravelUUID as id` .from (req.subject) ).id
    await next() // actually UPDATE or DELETE the subject entity
    await cds.run(`UPDATE ${Travel.drafts} SET TotalPrice = coalesce (BookingFee,0)
     + ( SELECT coalesce (sum(FlightPrice),0) from ${Booking.drafts} where to_Travel_TravelUUID = TravelUUID )
     + ( SELECT coalesce (sum(Price),0) from ${Supplements.drafts} where to_Travel_TravelUUID = TravelUUID )
    WHERE TravelUUID = ?`, [travel])
  }


  //
  // Action Implementations...
  //

  this.on ('acceptTravel', req => UPDATE (req.subject) .with ({ TravelStatus_code: 'A' }))
  this.on ('rejectTravel', req => UPDATE (req.subject) .with ({ TravelStatus_code: 'X' }))
  this.on ('deductDiscount', async req => {
    let discount = req.data.percent / 100
    let succeeded = await UPDATE (req.subject) .where `TravelStatus.code != 'A'` .and `BookingFee != null` .with (`
      TotalPrice = round (TotalPrice - BookingFee * ${discount}, 3),
      BookingFee = round (BookingFee - BookingFee * ${discount}, 3)
    `)
    if (!succeeded) { //> let's find out why...
      let travel = await SELECT.one `TravelID as ID, TravelStatus.code as status, BookingFee` .from (req.subject)
      if (!travel) throw req.reject (404, `Travel "${travel.ID}" does not exist; may have been deleted meanwhile.`)
      if (travel.status === 'A') req.reject (400, `Travel "${travel.ID}" has been approved already.`)
      if (travel.BookingFee == null) throw req.reject (404, `No discount possible, as travel "${travel.ID}" does not yet have a booking fee added.`)
    } else {
      return this.read(req.subject)
    }
  })


  // Add base class's handlers. Handlers registered above go first.
  return super.init()

}}

module.exports = { TravelService }
