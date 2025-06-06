using TravelService from '../../srv/travel-service';

//
// annotations that control the Fiori layout
//

annotate TravelService.Travel with @UI : {

  Identification : [
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.acceptTravel',   Label  : '{i18n>AcceptTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.rejectTravel',   Label  : '{i18n>RejectTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.deductDiscount', Label  : '{i18n>DeductDiscount}' }
  ],
  HeaderInfo : {
    TypeName       : '{i18n>Travel}',
    TypeNamePlural : '{i18n>Travels}',
    Title          : {
      $Type : 'UI.DataField',
      Value : Description
    },
    Description    : {
      $Type : 'UI.DataField',
      Value : TravelID
    }
  },
  PresentationVariant : {
    Text           : 'Default',
    Visualizations : ['@UI.LineItem'],
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : TravelID,
      Descending : true
    }]
  },
  SelectionFields : [
    to_Agency_AgencyID,
    to_Customer_CustomerID,
    TravelStatus_code
  ],
  LineItem : [
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.acceptTravel',   Label  : '{i18n>AcceptTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.rejectTravel',   Label  : '{i18n>RejectTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.deductDiscount', Label  : '{i18n>DeductDiscount}' },
    {
      Value : TravelID,
      @UI.Importance : #High
    },
    {
      Value : (to_Agency.AgencyID),
      @HTML5.CssDefaults: {width:'16em'}
    },
    {
      Value : (to_Customer.CustomerID),
      @UI.Importance : #High,
      @HTML5.CssDefaults: {width:'14em'}
    },
    { Value : BeginDate,  @HTML5.CssDefaults: {width:'9em'} },
    { Value : EndDate,    @HTML5.CssDefaults: {width:'9em'} },
    { Value : BookingFee, @HTML5.CssDefaults: {width:'10em'} },
    { Value : TotalPrice, @HTML5.CssDefaults: {width:'12em'} },
    {
      Value : (TravelStatus.code),
      Criticality : (TravelStatus.code = #Open ? 2 : (TravelStatus.code = #Accepted ? 3 : 0)),
      @UI.Importance : #High,
      @HTML5.CssDefaults: {width:'10em'}
    }
  ],
  Facets : [{
    $Type  : 'UI.CollectionFacet',
    Label  : '{i18n>GeneralInformation}',
    ID     : 'Travel',
    Facets : [
      {  // travel details
        $Type  : 'UI.ReferenceFacet',
        ID     : 'TravelData',
        Target : '@UI.FieldGroup#TravelData',
        Label  : '{i18n>GeneralInformation}'
      },
      {  // price information
        $Type  : 'UI.ReferenceFacet',
        ID     : 'PriceData',
        Target : '@UI.FieldGroup#PriceData',
        Label  : '{i18n>Prices}'
      },
      {  // date information
        $Type  : 'UI.ReferenceFacet',
        ID     : 'DateData',
        Target : '@UI.FieldGroup#DateData',
        Label  : '{i18n>Dates}'
      },
      {
        $Type : 'UI.ReferenceFacet',
        Label : '{i18n>Sustainability}',
        ID    : 'i18nSustainability',
        Target: '@UI.FieldGroup#i18nSustainability',
      }
    ]
  }],
  FieldGroup#TravelData : { Data : [
    { Value : TravelID               },
    { Value : (to_Agency.AgencyID)     },
    { Value : (to_Customer.CustomerID) },
    { Value : Description            },
    {
      $Type       : 'UI.DataField',
      Value       : (TravelStatus.code),
      Criticality : (TravelStatus.code = #Open ? 2 : (TravelStatus.code = #Accepted ? 3 : 0)),
      Label : '{i18n>Status}' // label only necessary if differs from title of element
    }
  ]},
  FieldGroup #DateData : {Data : [
    { $Type : 'UI.DataField', Value : BeginDate },
    { $Type : 'UI.DataField', Value : EndDate }
  ]},
  FieldGroup #PriceData : {Data : [
    { $Type : 'UI.DataField', Value : BookingFee },
    { $Type : 'UI.DataField', Value : TotalPrice },
    { $Type : 'UI.DataField', Value : (CurrencyCode.code) }
  ]},
  FieldGroup #i18nSustainability: {
    $Type: 'UI.FieldGroupType',
    Data : [
      {
        $Type: 'UI.DataField',
        Value: GoGreen,
      },
      {
        $Type: 'UI.DataField',
        Value: GreenFee,
      },
      {
        $Type: 'UI.DataField',
        Value: TreesPlanted,
      },
    ],
  }
};

annotate TravelService.Booking with @UI : {
  Identification : [
    { Value : BookingID },
  ],
  HeaderInfo : {
    TypeName       : '{i18n>Bookings}',
    TypeNamePlural : '{i18n>Bookings}',
    Title          : { Value : to_Customer.LastName },
    Description    : { Value : BookingID }
  },
  PresentationVariant : {
    Visualizations : ['@UI.LineItem'],
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : BookingID,
      Descending : false
    }]
  },
  SelectionFields : [],
  LineItem : [
    { Value : to_Carrier.AirlinePicURL,  Label : '  '},
    { Value : BookingID              },
    { Value : BookingDate            },
    { Value : (to_Customer.CustomerID) },
    { Value : (to_Carrier.AirlineID )  },
    { Value : ConnectionID,          Label : '{i18n>FlightNumber}' },
    { Value : FlightDate             },
    { Value : FlightPrice            },
    { Value : (BookingStatus.code),
      Criticality : (BookingStatus.code = #New ? 2 : (BookingStatus.code = #Booked ? 3 : 0)),
    }
  ],
  Facets : [{
    $Type  : 'UI.CollectionFacet',
    Label  : '{i18n>GeneralInformation}',
    ID     : 'Booking',
    Facets : [{  // booking details
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BookingData',
      Target : '@UI.FieldGroup#GeneralInformation',
      Label  : '{i18n>Booking}'
    }, {  // flight details
      $Type  : 'UI.ReferenceFacet',
      ID     : 'FlightData',
      Target : '@UI.FieldGroup#Flight',
      Label  : '{i18n>Flight}'
    }]
  }, {  // supplements list
    $Type  : 'UI.ReferenceFacet',
    ID     : 'SupplementsList',
    Target : 'to_BookSupplement/@UI.PresentationVariant',
    Label  : '{i18n>BookingSupplements}'
  }],
  FieldGroup #GeneralInformation : { Data : [
    { Value : BookingID              },
    { Value : BookingDate,           },
    { Value : (to_Customer.CustomerID) },
    { Value : BookingDate,           },
    { Value : (BookingStatus.code),
      Criticality : (BookingStatus.code = #New ? 2 : (BookingStatus.code = #Booked ? 3 : 0)),
     }
  ]},
  FieldGroup #Flight : { Data : [
    { Value : (to_Carrier.AirlineID) },
    { Value : ConnectionID           },
    { Value : FlightDate             },
    { Value : FlightPrice            }
  ]},
};

annotate TravelService.BookingSupplement with @UI : {
  Identification : [
    { Value : BookingSupplementID }
  ],
  HeaderInfo : {
    TypeName       : '{i18n>BookingSupplement}',
    TypeNamePlural : '{i18n>BookingSupplements}',
    Title          : { Value : BookingSupplementID },
    Description    : { Value : BookingSupplementID }
  },
  PresentationVariant : {
    Text           : 'Default',
    Visualizations : ['@UI.LineItem'],
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : BookingSupplementID,
      Descending : false
    }]
  },
  LineItem : [
    { Value : BookingSupplementID                                       },
    { Value : (to_Supplement.SupplementID), Label : '{i18n>ProductID}'    },
    { Value : Price,                        Label : '{i18n>ProductPrice}' }
  ],
};
