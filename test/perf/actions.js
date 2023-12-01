const sleep = n => new Promise(resolve => setTimeout(resolve, n))

module.exports.landingPage = async function (user, options) {
  const travelList = {
    name: 'landingPageList',
    SELECT: {
      from: { ref: ['processor', 'Travel'] },
      count: true,
      columns: [
        { ref: ['BeginDate'] },
        { ref: ['CurrencyCode_code'] },
        { ref: ['Description'] },
        { ref: ['EndDate'] },
        { ref: ['HasActiveEntity'] },
        { ref: ['HasDraftEntity'] },
        { ref: ['IsActiveEntity'] },
        { ref: ['TotalPrice'] },
        { ref: ['TravelID'] },
        { ref: ['TravelStatus_code'] },
        { ref: ['TravelUUID'] },
        { ref: ['to_Agency_AgencyID'] },
        { ref: ['to_Customer_CustomerID'] },
        {
          ref: ['DraftAdministrativeData'], expand: [
            { ref: ['DraftUUID'] },
            { ref: ['InProcessByUser'] },
            { ref: ['LastChangedByUser'] },
          ]
        }, {
          ref: ['TravelStatus'], expand: [
            { ref: ['code'] },
            { ref: ['name'] },
          ]
        }, {
          ref: ['to_Agency'], expand: [
            { ref: ['AgencyID'] },
            { ref: ['Name'] },
          ]
        }, {
          ref: ['to_Customer'], expand: [
            { ref: ['CustomerID'] },
            { ref: ['LastName'] },
          ]
        },
      ],
      orderBy: [
        { ref: ['TravelID'], sort: 'desc' }
      ],
      where: [
        { ref: ['IsActiveEntity'] },
        '=',
        { val: false },
        'or',
        { ref: ['SiblingEntity', 'IsActiveEntity'] },
        '=',
        { val: null }
      ],
      limit: {
        rows: { val: 30 },
        offset: { val: 0 }
      }
    }
  }

  const agencyPopup = {
    name: 'landingPageAgencyPopup',
    SELECT: {
      from: { ref: ['processor', 'TravelAgency'] },
      count: true,
      columns: [
        { ref: ['AgencyID'] },
        { ref: ['City'] },
        { ref: ['CountryCode_code'] },
        { ref: ['EMailAddress'] },
        { ref: ['Name'] },
        { ref: ['PhoneNumber'] },
        { ref: ['PostalCode'] },
        { ref: ['Street'] },
        { ref: ['WebAddress'] },
      ],
      orderby: [
        { ref: ['AgencyID'] },
      ],
      limit: {
        rows: { val: 58 }
      }
    }
  }

  const customerPopup = {
    name: 'landingPageCustomerPopup',
    SELECT: {
      from: { ref: ['processor', 'Passenger'] },
      count: true,
      columns: [
        { ref: ['City'] },
        { ref: ['CountryCode_code'] },
        { ref: ['CustomerID'] },
        { ref: ['EMailAddress'] },
        { ref: ['FirstName'] },
        { ref: ['LastName'] },
        { ref: ['PhoneNumber'] },
        { ref: ['PostalCode'] },
        { ref: ['Street'] },
        { ref: ['Title'] },
      ],
      orderby: [
        { ref: ['CustomerID'] },
      ],
      limit: {
        rows: { val: 58 }
      }
    }
  }

  const travelStatusPopover = {
    name: 'landingPageStatusPopover',
    SELECT: {
      from: { ref: ['processor', 'TravelStatus'] },
      columns: [
        { ref: ['code'] },
        { ref: ['name'] },
      ],
      orderby: [
        { ref: ['CustomerID'] },
      ],
      limit: {
        rows: { val: 100 }
      }
    }
  }

  const { scroll = {}, filter = {} } = options

  const { search, editStatus, agency, customer, travelStatus } = filter

  // Load page before starting to apply the filters
  if (search || editStatus || agency || customer || travelStatus) {
    await user.exec(travelList)
    await sleep(1000)
  }

  if(search) {
    travelList.SELECT.search = search
  }

  if (agency) {
    const speed = agency.speed || 2000
    await user.exec(agencyPopup)
    await sleep(speed)
    const search = agency.search
    if (search) {
      agencyPopup.SELECT.search = search
      await user.exec(agencyPopup)
      await sleep(speed)
    }
  }

  if (customer) {
    const speed = customer.speed || 2000
    await user.exec(customerPopup)
    await sleep(speed)
    const search = customer.search
    if (search) {
      customerPopup.SELECT.search = search
      await user.exec(customerPopup)
      await sleep(speed)
    }
  }

  if (travelStatus) {
    const speed = travelStatus.speed || 1000
    await user.exec(travelStatusPopover)
    await sleep(speed)
  }

  const scrollSpeed = scroll.speed || 2000
  const scrollAmount = scroll.rows || 0
  for (let offset = 0; offset < scrollAmount; offset += 30) {
    travelList.SELECT.limit.offset.val = offset
    await user.exec(travelList)
    await sleep(scrollSpeed)
  }
}
