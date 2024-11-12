"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelService = void 0;
const cds_1 = require("@sap/cds");
const cds = __importStar(require("@sap/cds"));
const TravelService_1 = require("#cds-models/TravelService");
const travel_1 = require("#cds-models/sap/fe/cap/travel");
class TravelService extends cds_1.ApplicationService {
  init() {
    /**
     * Fill in primary keys for new Travels.
     * Note: In contrast to Bookings and BookingSupplements that has to happen
     * upon SAVE, as multiple users could create new Travels concurrently.
     */
    this.before("CREATE", TravelService_1.Travel, async (req) => {
      // FIXME: TS v
      const { maxID } = await SELECT.one`max(TravelID) as maxID`.from(
        TravelService_1.Travel
      );
      req.data.TravelID = maxID + 1;
    });
    /**
     * Fill in defaults for new Bookings when editing Travels.
     */
    this.before("NEW", TravelService_1.Booking.drafts, async (req) => {
      const { to_Travel_TravelUUID } = req.data;
      const { status } = await SELECT.one.from(
        TravelService_1.Travel.drafts,
        to_Travel_TravelUUID,
        (t) => t.TravelStatus_code.as("status")
      );
      if (status === travel_1.TravelStatusCode.Canceled)
        throw req.reject(400, "Cannot add new bookings to rejected travels.");
      // FIXME: TS v
      const { maxID } = await SELECT.one`max(BookingID) as maxID`
        .from(TravelService_1.Booking.drafts)
        .where({ to_Travel_TravelUUID });
      req.data.BookingID = maxID + 1;
      req.data.BookingStatus_code = travel_1.BookingStatusCode.New;
      req.data.BookingDate = new Date().toISOString().slice(0, 10); // today
    });
    /**
     * Fill in defaults for new BookingSupplements when editing Travels.
     */
    this.before(
      "NEW",
      TravelService_1.BookingSupplement.drafts,
      async (req) => {
        const { to_Booking_BookingUUID } = req.data;
        // FIXME: TS v
        const { maxID } = await SELECT.one`max(BookingSupplementID) as maxID`
          .from(TravelService_1.BookingSupplement.drafts)
          .where({ to_Booking_BookingUUID });
        req.data.BookingSupplementID = maxID + 1;
      }
    );
    /**
     * Changing Booking Fees is only allowed for not yet accapted Travels.
     */
    this.before("UPDATE", TravelService_1.Travel.drafts, async (req) => {
      if ("BookingFee" in req.data) {
        const { TravelStatus_code: status } = await SELECT.one.from(
          req.subject
        );
        if (status === travel_1.TravelStatusCode.Accepted)
          req.reject(
            400,
            "Booking fee can not be updated for accepted travels.",
            "BookingFee"
          );
      }
    });
    /**
     * Update the Travel's TotalPrice when its BookingFee is modified.
     */
    this.after("UPDATE", TravelService_1.Travel.drafts, (_, req) => {
      if ("BookingFee" in req.data) {
        return this._update_totals4(req.data.TravelUUID);
      }
    });
    /**
     * Update the Travel's TotalPrice when a Booking's FlightPrice is modified.
     */
    this.after("UPDATE", TravelService_1.Booking.drafts, async (_, req) => {
      if ("FlightPrice" in req.data) {
        // We need to fetch the Travel's UUID for the given Booking target
        const { travel } =
          await SELECT.one`to_Travel_TravelUUID as travel`.from(req.subject);
        return this._update_totals4(travel);
      }
    });
    /**
     * Update the Travel's TotalPrice when a Supplement's Price is modified.
     */
    this.after(
      "UPDATE",
      TravelService_1.BookingSupplement.drafts,
      async (_, req) => {
        if ("Price" in req.data) {
          const { BookSupplUUID } = req.data;
          // We need to fetch the Travel's UUID for the given Supplement target
          const BookingUUID = SELECT.one(
            TravelService_1.BookingSupplement.drafts,
            (b) => b.to_Booking_BookingUUID
          ).where({ BookSupplUUID });
          const { to_Travel_TravelUUID: travel } = await SELECT.one(
            TravelService_1.Booking.drafts,
            (b) => b.to_Travel_TravelUUID
          ).where({ BookingUUID });
          return this._update_totals4(travel);
        }
      }
    );
    /**
     * Update the Travel's TotalPrice when a Booking Supplement is deleted.
     */
    this.on(
      "CANCEL",
      TravelService_1.BookingSupplement.drafts,
      async (req, next) => {
        // Find out which travel is affected before the delete
        const { BookSupplUUID } = req.data;
        const { to_Travel_TravelUUID } = await SELECT.one
          .from(
            TravelService_1.BookingSupplement.drafts,
            (b) => b.to_Travel_TravelUUID
          )
          .where({ BookSupplUUID });
        // Delete handled by generic handlers
        const res = await next();
        // After the delete, update the totals
        await this._update_totals4(to_Travel_TravelUUID);
        return res;
      }
    );
    /**
     * Update the Travel's TotalPrice when a Booking is deleted.
     */
    this.on("CANCEL", TravelService_1.Booking.drafts, async (req, next) => {
      // Find out which travel is affected before the delete
      const { BookingUUID } = req.data;
      const { to_Travel_TravelUUID } = await SELECT.one
        .from(TravelService_1.Booking.drafts, (b) => b.to_Travel_TravelUUID)
        .where({ BookingUUID });
      // Delete handled by generic handlers
      const res = await next();
      // After the delete, update the totals
      await this._update_totals4(to_Travel_TravelUUID);
      return res;
    });
    /**
     * Validate a Travel's edited data before save.
     */
    this.before("SAVE", TravelService_1.Travel, (req) => {
      const {
          BeginDate,
          EndDate,
          BookingFee,
          to_Agency_AgencyID,
          to_Customer_CustomerID,
          to_Booking,
          TravelStatus_code,
        } = req.data,
        today = new Date().toISOString().slice(0, 10);
      // validate only not rejected travels
      if (TravelStatus_code !== travel_1.TravelStatusCode.Canceled) {
        if (BookingFee == null)
          req.error(400, "Enter a booking fee", "in/BookingFee"); // 0 is a valid BookingFee
        if (!BeginDate) req.error(400, "Enter a begin date", "in/BeginDate");
        if (!EndDate) req.error(400, "Enter an end date", "in/EndDate");
        if (!to_Agency_AgencyID)
          req.error(400, "Enter a travel agency", "in/to_Agency_AgencyID");
        if (!to_Customer_CustomerID)
          req.error(400, "Enter a customer", "in/to_Customer_CustomerID");
        for (const booking of to_Booking) {
          const {
            BookingUUID,
            ConnectionID,
            FlightDate,
            FlightPrice,
            BookingStatus_code,
            to_Carrier_AirlineID,
            to_Customer_CustomerID,
          } = booking;
          if (!ConnectionID)
            req.error(
              400,
              "Enter a flight",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/ConnectionID`
            );
          if (!FlightDate)
            req.error(
              400,
              "Enter a flight date",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/FlightDate`
            );
          if (!FlightPrice)
            req.error(
              400,
              "Enter a flight price",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/FlightPrice`
            );
          if (!BookingStatus_code)
            req.error(
              400,
              "Enter a booking status",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/BookingStatus_code`
            );
          if (!to_Carrier_AirlineID)
            req.error(
              400,
              "Enter an airline",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_Carrier_AirlineID`
            );
          if (!to_Customer_CustomerID)
            req.error(
              400,
              "Enter a customer",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_Customer_CustomerID`
            );
          for (const suppl of booking.to_BookSupplement) {
            const { BookSupplUUID, Price, to_Supplement_SupplementID } = suppl;
            if (!Price)
              req.error(
                400,
                "Enter a price",
                `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_BookSupplement(BookSupplUUID='${BookSupplUUID}',IsActiveEntity=false)/Price`
              );
            if (!to_Supplement_SupplementID)
              req.error(
                400,
                "Enter a supplement",
                `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_BookSupplement(BookSupplUUID='${BookSupplUUID}',IsActiveEntity=false)/to_Supplement_SupplementID`
              );
          }
        }
      }
      if (BeginDate < today)
        req.error(
          400,
          `Begin Date ${BeginDate} must not be before today ${today}.`,
          "in/BeginDate"
        );
      if (BeginDate > EndDate)
        req.error(
          400,
          `Begin Date ${BeginDate} must be before End Date ${EndDate}.`,
          "in/BeginDate"
        );
    });
    //
    // Action Implementations...
    //
    const { acceptTravel, rejectTravel, deductDiscount } =
      TravelService_1.Travel.actions;
    this.on(acceptTravel, (req) =>
      UPDATE(req.subject).with({
        TravelStatus_code: travel_1.TravelStatusCode.Accepted,
      })
    );
    this.on(rejectTravel, (req) =>
      UPDATE(req.subject).with({
        TravelStatus_code: travel_1.TravelStatusCode.Canceled,
      })
    );
    this.on(deductDiscount, async (req) => {
      let discount = req.data.percent / 100;
      let succeeded = await UPDATE(req.subject).where`TravelStatus_code != 'A'`
        .and`BookingFee is not null`
        .set`TotalPrice = round (TotalPrice - BookingFee * ${discount}, 3)`
        .set`BookingFee = round (BookingFee - BookingFee * ${discount}, 3)`;
      if (!succeeded) {
        //> let's find out why...
        let travel =
          await SELECT.one`TravelID as ID, TravelStatus_code as status, BookingFee`.from(
            req.subject
          );
        if (!travel)
          throw req.reject(
            404,
            `Travel "${travel.ID}" does not exist; may have been deleted meanwhile.`
          );
        if (travel.status === travel_1.TravelStatusCode.Accepted)
          req.reject(400, `Travel "${travel.ID}" has been approved already.`);
        if (travel.BookingFee == null)
          throw req.reject(
            404,
            `No discount possible, as travel "${travel.ID}" does not yet have a booking fee added.`
          );
      } else {
        return SELECT(req.subject);
      }
    });
    /**
     * Trees-for-Tickets: Update totals including green flight fee
     */
    this.after("UPDATE", "Travel.drafts", (_, req) => {
      if ("GoGreen" in req.data) {
        return this._update_totalsGreen(req);
      }
    });
    // Add base class's handlers. Handlers registered above go first.
    return super.init();
  }
  /**
   * Helper to re-calculate a Travel's TotalPrice from BookingFees, FlightPrices and Supplement Prices.
   */
  async _update_totals4(travel) {
    const { Travel, Booking, BookingSupplement } = this.entities;
    // Using plain native SQL for such complex queries
    await cds.run(
      `UPDATE ${Travel.drafts} SET
    TotalPrice = coalesce(BookingFee,0)
    + ( SELECT coalesce (sum(FlightPrice),0) from ${Booking.drafts} where to_Travel_TravelUUID = TravelUUID )
    + ( SELECT coalesce (sum(Price),0) from ${BookingSupplement.drafts} where to_Travel_TravelUUID = TravelUUID )
  WHERE TravelUUID = ?`,
      [travel]
    );
  }
  /**
   * Trees-for-Tickets: helper to update totals including green flight fee
   */
  async _update_totalsGreen(req) {
    const { Travel } = this.entities;
    const [{ TotalPrice }] = await cds.read([
      SELECT.one`TotalPrice, GreenFee`.from(Travel.drafts, req.data.TravelUUID),
    ]);
    if (req.data.GoGreen) {
      req.info({
        code: 204,
        message:
          "Trees-4-Tickets: " +
          Math.round(TotalPrice * 0.01, 0) +
          " tree plants scheduled",
        numericSeverity: 1,
      });
      return UPDATE(Travel.drafts, req.data.TravelUUID).with(`
        TotalPrice = TotalPrice + round (TotalPrice * 0.01, 0),
        GreenFee = round (TotalPrice * 0.01, 0),
        TreesPlanted = round(TotalPrice * 0.01, 0)
    `);
    } else {
      this._update_totals4(req.data.TravelUUID);
      return UPDATE(Travel.drafts, req.data.TravelUUID).with(`
        TotalPrice = TotalPrice - GreenFee,
        GreenFee = 0,
        TreesPlanted = 0
    `);
    }
  }
}
exports.TravelService = TravelService;
