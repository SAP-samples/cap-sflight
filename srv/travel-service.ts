import { ApplicationService } from '@sap/cds'
import * as cds from '@sap/cds'
import { Booking, BookingSupplement, Travel } from '#cds-models/TravelService'
import { BookingStatusCode, TravelStatusCode } from '#cds-models/sap/fe/cap/travel'
import { CdsDate } from '#cds-models/_'


export class TravelService extends ApplicationService {
init() {

  /**
   * Fill in primary keys for new Travels.
   * Note: In contrast to Bookings and BookingSupplements that has to happen
   * upon SAVE, as multiple users could create new Travels concurrently.
   */
  this.before ('CREATE', Travel, async req => {
    // FIXME: TS v
    const { maxID } = await SELECT.one `max(TravelID) as maxID` .from(Travel) as unknown as { maxID: number }
    req.data.TravelID = maxID + 1
  })


  /**
   * Fill in defaults for new Bookings when editing Travels.
   */
  this.before ('NEW', Booking.drafts, async (req) => {
    const { to_Travel_TravelUUID } = req.data
    const { status } = await SELECT.one .from (Travel.drafts, to_Travel_TravelUUID, t => t.TravelStatus_code.as('status')) as { status: string }
    if (status === TravelStatusCode.Canceled) throw req.reject (400, 'Cannot add new bookings to rejected travels.')
    // FIXME: TS v
    const { maxID } = await SELECT.one `max(BookingID) as maxID` .from(Booking.drafts) .where({ to_Travel_TravelUUID }) as unknown as { maxID: number }
    req.data.BookingID = maxID + 1
    req.data.BookingStatus_code = BookingStatusCode.New
    req.data.BookingDate = (new Date).toISOString().slice(0, 10) as CdsDate // today
  })


  /**
   * Fill in defaults for new BookingSupplements when editing Travels.
   */
  this.before ('NEW', BookingSupplement.drafts, async (req) => {
    const { to_Booking_BookingUUID } = req.data
    // FIXME: TS v
    const { maxID } = await SELECT.one `max(BookingSupplementID) as maxID` .from(BookingSupplement.drafts) .where({ to_Booking_BookingUUID }) as unknown as { maxID: number }
    req.data.BookingSupplementID = maxID + 1
  })


  /**
   * Changing Booking Fees is only allowed for not yet accapted Travels.
   */
  this.before ('UPDATE', Travel.drafts, async (req) => { if ('BookingFee' in req.data) {
    const { TravelStatus_code: status } = await SELECT.one .from(req.subject) as Travel
    if (status === TravelStatusCode.Accepted) req.reject(400, 'Booking fee can not be updated for accepted travels.', 'BookingFee')
  }})


  /**
   * Update the Travel's TotalPrice when its BookingFee is modified.
   */
  this.after('UPDATE', Travel.drafts, (_, req) => { if ('BookingFee' in req.data) {
    return this._update_totals4 (req.data.TravelUUID)
  }})


  /**
   * Update the Travel's TotalPrice when a Booking's FlightPrice is modified.
   */
  this.after ('UPDATE', Booking.drafts, async (_, req) => { if ('FlightPrice' in req.data) {
    // We need to fetch the Travel's UUID for the given Booking target
    const { travel } = await SELECT.one `to_Travel_TravelUUID as travel` .from(req.subject)
    return this._update_totals4 (travel)
  }})


  /**
   * Update the Travel's TotalPrice when a Supplement's Price is modified.
   */
  this.after ('UPDATE', BookingSupplement.drafts, async (_, req) => { if ('Price' in req.data) {
    const { BookSupplUUID } = req.data
    // We need to fetch the Travel's UUID for the given Supplement target
    const BookingUUID = SELECT.one(BookingSupplement.drafts, b => b.to_Booking_BookingUUID) .where({ BookSupplUUID })
    const { to_Travel_TravelUUID: travel } = await SELECT.one (Booking.drafts, b => b.to_Travel_TravelUUID) .where({ BookingUUID })
    return this._update_totals4(travel)
  }})

  /**
   * Update the Travel's TotalPrice when a Booking Supplement is deleted.
   */
  this.on('CANCEL', BookingSupplement.drafts, async (req, next) => {
    // Find out which travel is affected before the delete
    const { BookSupplUUID } = req.data
    const { to_Travel_TravelUUID } = await SELECT.one
      .from(BookingSupplement.drafts, b => b.to_Travel_TravelUUID)
      .where({ BookSupplUUID })
    // Delete handled by generic handlers
    const res = await next()
    // After the delete, update the totals
    await this._update_totals4(to_Travel_TravelUUID)
    return res
  })

  /**
   * Update the Travel's TotalPrice when a Booking is deleted.
   */
  this.on('CANCEL', Booking.drafts, async (req, next) => {
    // Find out which travel is affected before the delete
    const { BookingUUID } = req.data
    const { to_Travel_TravelUUID } = await SELECT.one
      .from(Booking.drafts, b => b.to_Travel_TravelUUID)
      .where({ BookingUUID })
    // Delete handled by generic handlers
    const res = await next()
    // After the delete, update the totals
    await this._update_totals4(to_Travel_TravelUUID)
    return res
  })


  /**
   * Validate a Travel's edited data before save.
   */
  this.before ('SAVE', Travel, req => {
    const { BeginDate, EndDate, BookingFee, to_Agency_AgencyID, to_Customer_CustomerID, to_Booking, TravelStatus_code } = req.data, today = (new Date).toISOString().slice(0,10)

    // validate only not rejected travels
    if (TravelStatus_code !== TravelStatusCode.Canceled) {
      if (BookingFee == null) req.error(400, "Enter a booking fee", "in/BookingFee") // 0 is a valid BookingFee
      if (!BeginDate) req.error(400, "Enter a begin date", "in/BeginDate")
      if (!EndDate) req.error(400, "Enter an end date", "in/EndDate")
      if (!to_Agency_AgencyID) req.error(400, "Enter a travel agency", "in/to_Agency_AgencyID")
      if (!to_Customer_CustomerID) req.error(400, "Enter a customer", "in/to_Customer_CustomerID")

      for (const booking of to_Booking) {
        const { BookingUUID, ConnectionID, FlightDate, FlightPrice, BookingStatus_code, to_Carrier_AirlineID, to_Customer_CustomerID } = booking
        if (!ConnectionID) req.error(400, "Enter a flight", `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/ConnectionID`)
        if (!FlightDate) req.error(400, "Enter a flight date", `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/FlightDate`)
        if (!FlightPrice) req.error(400, "Enter a flight price", `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/FlightPrice`)
        if (!BookingStatus_code) req.error(400, "Enter a booking status", `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/BookingStatus_code`)
        if (!to_Carrier_AirlineID) req.error(400, "Enter an airline", `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_Carrier_AirlineID`)
        if (!to_Customer_CustomerID) req.error(400, "Enter a customer", `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_Customer_CustomerID`)

        for (const suppl of booking.to_BookSupplement) {
          const { BookSupplUUID, Price, to_Supplement_SupplementID } = suppl
          if (!Price) req.error(400, "Enter a price", `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_BookSupplement(BookSupplUUID='${BookSupplUUID}',IsActiveEntity=false)/Price`)
          if (!to_Supplement_SupplementID) req.error(400, "Enter a supplement", `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_BookSupplement(BookSupplUUID='${BookSupplUUID}',IsActiveEntity=false)/to_Supplement_SupplementID`)
        }
      }
    }

    if (BeginDate < today) req.error (400, `Begin Date ${BeginDate} must not be before today ${today}.`, 'in/BeginDate')
    if (BeginDate > EndDate) req.error (400, `Begin Date ${BeginDate} must be before End Date ${EndDate}.`, 'in/BeginDate')
  })


  //
  // Action Implementations...
  //
  const { acceptTravel, rejectTravel, deductDiscount } = Travel.actions

  this.on(acceptTravel, req => UPDATE(req.subject).with({ TravelStatus_code: TravelStatusCode.Accepted }))
  this.on(rejectTravel, req => UPDATE(req.subject).with({ TravelStatus_code: TravelStatusCode.Canceled }))
  this.on(deductDiscount, async req => {
    let discount = req.data.percent / 100
    let succeeded = await UPDATE(req.subject)
      .where `TravelStatus_code != 'A'`
      .and `BookingFee is not null`
      .set `TotalPrice = round (TotalPrice - BookingFee * ${discount}, 3)`
      .set `BookingFee = round (BookingFee - BookingFee * ${discount}, 3)`

    if (!succeeded) { //> let's find out why...
      let travel = await SELECT.one `TravelID as ID, TravelStatus_code as status, BookingFee` .from(req.subject)
      if (!travel) throw req.reject (404, `Travel "${travel.ID}" does not exist; may have been deleted meanwhile.`)
      if (travel.status === TravelStatusCode.Accepted) req.reject (400, `Travel "${travel.ID}" has been approved already.`)
      if (travel.BookingFee == null) throw req.reject (404, `No discount possible, as travel "${travel.ID}" does not yet have a booking fee added.`)
    } else {
      return SELECT(req.subject)
    }
  })


  // Add base class's handlers. Handlers registered above go first.
  return super.init()

}


/**
 * Helper to re-calculate a Travel's TotalPrice from BookingFees, FlightPrices and Supplement Prices.
 */
async _update_totals4(travel: string) {
  const { Travel, Booking, BookingSupplement } = this.entities
  // Using plain native SQL for such complex queries
  await cds.run(`UPDATE ${Travel.drafts} SET
    TotalPrice = coalesce(BookingFee,0)
    + ( SELECT coalesce (sum(FlightPrice),0) from ${Booking.drafts} where to_Travel_TravelUUID = TravelUUID )
    + ( SELECT coalesce (sum(Price),0) from ${BookingSupplement.drafts} where to_Travel_TravelUUID = TravelUUID )
  WHERE TravelUUID = ?`, [travel])
}}
