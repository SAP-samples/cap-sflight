using AnalyticsService as service from '../../srv/analytics-service';

annotate service.Bookings with @(
  Aggregation.CustomAggregate #FlightPrice : 'Edm.Decimal',
  Aggregation.CustomAggregate #CurrencyCode_code : 'Edm.String',
  Common.SemanticKey : [ID],
) {
  ID                @ID : 'ID';
  FlightPrice       @Aggregation.default: #SUM;
  CurrencyCode_code @Aggregation.default: #MAX;
};

annotate service.Bookings with @Aggregation.ApplySupported : {
  GroupableProperties  : [
    TravelID,
    BookingID,
    CombinedID,
    ConnectionID,
    FlightDate,
    CurrencyCode_code,
    status,
    airline,
  ],
  AggregatableProperties : [
    {Property : status      },
    {Property : FlightPrice },
    {Property : ID          },
  ],
};

annotate service.Bookings with @(
  Analytics.AggregatedProperty #countBookings :
  {
    Name                 : 'countBookings',
    AggregationMethod    : 'countdistinct',
    AggregatableProperty : ID,
    @Common.Label        : '{i18n>Bookings}'
  },
  Analytics.AggregatedProperty #minPrice :
  {
    Name                 : 'minPrice',
    AggregationMethod    : 'min',
    AggregatableProperty : FlightPrice,
    @Common.Label        : '{i18n>MinPrice}'
  },
  Analytics.AggregatedProperty #maxPrice :
  {
    Name                 : 'maxPrice',
    AggregationMethod    : 'max',
    AggregatableProperty : FlightPrice,
    @Common.Label        : '{i18n>MaxPrice}'
  },
  Analytics.AggregatedProperty #avgPrice :
  {
    Name                 : 'avgPrice',
    AggregationMethod    : 'average',
    AggregatableProperty : FlightPrice,
    @Common.Label        : '{i18n>AvgPrice}'
  },
  // measure "sum of prices" is available by default (but name/label doesn't indicate summing -> ?)
  // Analytics.AggregatedProperty #sumPrice :
  //  {
  //   Name                 : 'sumPrice',
  //   AggregationMethod    : 'sum',
  //   AggregatableProperty : FlightPrice,
  //   @Common.Label        : '{i18n>TotalPrice}'
  // }
);


annotate service.Bookings with @UI.LineItem : [
  {
    Value          : TravelID,
    @UI.Importance : #High,
    @HTML5.CssDefaults: {width:'8em'},
  }, {
    Value          : BookingID,
    Label          : '{i18n>Booking}',
    @UI.Importance : #High,
    @HTML5.CssDefaults: {width:'8em'},
  }, {
    Value          : airline,
    @UI.Importance : #High,
    @HTML5.CssDefaults: {width:'14em'},
  }, {
    Value          : ConnectionID,
    @UI.Importance : #High,
    @HTML5.CssDefaults: {width:'8em'},
  }, {
    Value          : FlightDate,
    @UI.Importance : #High,
  }, {
    Value          : FlightPrice,
    @UI.Importance : #High,
    @HTML5.CssDefaults: {width:'12em'},
  }, {
    Value          : status,
    @UI.Importance : #High,
    @HTML5.CssDefaults: {width:'8em'},
  }
];


annotate service.Bookings with @UI.Chart : {
  Title               : '{i18n>Bookings}',
  ChartType           : #Column,
  DynamicMeasures : [
    '@Analytics.AggregatedProperty#minPrice',
    '@Analytics.AggregatedProperty#maxPrice',
    '@Analytics.AggregatedProperty#avgPrice'
  ],
  Dimensions          : [airline],
  MeasureAttributes   : [{
    DynamicMeasure : '@Analytics.AggregatedProperty#minPrice',
    Role    : #Axis1
  }],
  DimensionAttributes : [{
    Dimension : airline,
    Role      : #Category
  }],
};
annotate service.Bookings with @UI.PresentationVariant : {
  GroupBy : [  // default grouping in table
    airline,
    status
  ],
  Total : [    // default aggregation in table
    FlightPrice
  ],
  Visualizations : [
    '@UI.Chart',
    '@UI.LineItem',
  ]
};


//
// Visual Filters
//
annotate service.Bookings with @(
  UI.PresentationVariant #pvAirline : {
    Visualizations : ['@UI.Chart#chartAirline']
  },
  UI.Chart #chartAirline : {
    ChartType           : #Bar,
    DynamicMeasures : [
      '@Analytics.AggregatedProperty#countBookings',
    ],
    Dimensions          : [airline],
    MeasureAttributes   : [{
      DynamicMeasure : '@Analytics.AggregatedProperty#countBookings',
      Role      : #Axis1,
    }],
    DimensionAttributes : [{
      Dimension : airline,
      Role      : #Category
    }],
  }
) {
  airline @(
    Common.ValueList #vlAirline : {
      CollectionPath               : 'Bookings',
      PresentationVariantQualifier : 'pvAirline',
      Parameters                   : [{
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : airline,
        ValueListProperty : 'airline'
      }]
    },
    Common.ValueList : {
      CollectionPath : 'Airline',
      Parameters : [{
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : airline,
        ValueListProperty : 'AirlineID',
      }, {
          $Type : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'Name',
      }]
    }
  )
};


annotate service.Bookings with @(
  UI.PresentationVariant #pvStatus : {
    Visualizations : ['@UI.Chart#chartStatus']
  },
  UI.Chart #chartStatus : {
    ChartType           : #Bar,
    DynamicMeasures : [
      '@Analytics.AggregatedProperty#countBookings',
    ],
    Dimensions          : [status],
    MeasureAttributes   : [{
      DynamicMeasure : '@Analytics.AggregatedProperty#countBookings',
      Role      : #Axis1,
    }],
    DimensionAttributes : [{
      Dimension : status,
      Role      : #Category
    }]
  }
) {
  status @(
    Common.ValueList #vlStatus : {
      CollectionPath               : 'Bookings',
      PresentationVariantQualifier : 'pvStatus',
      Parameters                   : [{
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : status,
        ValueListProperty : 'status'
      }]
    },
    Common.ValueList : {
      CollectionPath : 'BookingStatus',
      Parameters : [{
        $Type : 'Common.ValueListParameterInOut',
        LocalDataProperty : status,
        ValueListProperty : 'code',
      }]
    },
    //Common.ValueListWithFixedValues : true
  )
};


annotate service.Bookings with @(
  UI.PresentationVariant #pvFlightDate : {
    SortOrder      : [{
      Property   : FlightDate,
      Descending : true
    }],
    Visualizations : ['@UI.Chart#chartFlightDate']
  },
  UI.Chart #chartFlightDate            : {
    Title               : 'Bookings over FlightDate',
    ChartType           : #Line,
    DynamicMeasures : [
      '@Analytics.AggregatedProperty#countBookings',
    ],
    Dimensions          : [FlightDate],
    MeasureAttributes   : [{
      DynamicMeasure : '@Analytics.AggregatedProperty#countBookings',
      Role      : #Axis1,
    }],
    DimensionAttributes : [{
      Dimension : FlightDate,
      Role      : #Category
    }]
  }
) {
  FlightDate @Common.ValueList #vlFlightDate : {
    CollectionPath               : 'Bookings',
    PresentationVariantQualifier : 'pvFlightDate',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : FlightDate,
      ValueListProperty : 'FlightDate'
    }]
  };
};



//
// KPI
//
annotate service.Bookings with @(
  UI.KPI #myKPI1 : {
    DataPoint : {
      Value            : FlightPrice,
      Title            : 'TOT',
      Description      : '{i18n>Total Price}',
      CriticalityCalculation : {
        ImprovementDirection: #Maximize,
        AcceptanceRangeLowValue: 26000000,
        ToleranceRangeLowValue:  24000000,
        DeviationRangeLowValue:  22000000
      }
    },
    Detail : {
      DefaultPresentationVariant : {
        Visualizations : [
          '@UI.Chart#kpi1'
        ],
      },
    },
    SelectionVariant : {
      SelectOptions : [{
        PropertyName : FlightPrice,
        Ranges       : [{
          Sign   : #E,
          Option : #EQ,
          Low    : 0,
        }, ],
      }],
    }
  },
  UI.Chart #kpi1 : {
    ChartType         : #Line,
    Measures          : [FlightPrice],
    Dimensions        : [FlightDate],
    MeasureAttributes : [{
      Measure : FlightPrice,
      Role    : #Axis1
    }],
    DimensionAttributes : [{
      Dimension : FlightDate,
      Role      : #Category
    }]
  },
);



//
// Detail page
//
annotate service.Bookings with @UI : {
  Identification : [
    { Value : CombinedID },
  ],
  HeaderInfo : {
    TypeName       : '{i18n>Bookings}',
    TypeNamePlural : '{i18n>Bookings}',
    Title          : { Value : CombinedID },
    Description    : { Value : CombinedID }
  },
  Facets : [{
    $Type  : 'UI.CollectionFacet',
    Label  : '{i18n>BookingDetails}',
    ID     : 'Booking',
    Facets : [{
      $Type  : 'UI.ReferenceFacet',
      ID     : 'TravelData',
      Target : '@UI.FieldGroup#TravelInformation',
      Label  : '{i18n>Travel}'
    }, {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BookingData',
      Target : '@UI.FieldGroup#BookingInformation',
      Label  : '{i18n>Booking}'
    }, {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'FlightData',
      Target : '@UI.FieldGroup#FlightInformation',
      Label  : '{i18n>Flight}'
    }]
  }],
  FieldGroup #TravelInformation : { Data : [
    { Value : to_Travel.TravelID,
      Label : '{i18n>TravelID}'            },
    { Value : to_Travel.Description        },
    { Value : to_Travel.to_Agency.Name,    },
    { Value : to_Travel.CustomerName,      },
    { Value : to_Travel.TravelStatus.code,
      Label : '{i18n>Status}'              },    // why does the label not come from below?
  ]},
  FieldGroup #BookingInformation : { Data : [
    { Value : BookingID,
      Label : '{i18n>BookingID}'        },
    { Value : BookingDate               },
    { Value : FlightDate,               },
    { Value : FlightPrice               },
    { Value : status,
      Label : '{i18n>Status}'           },
  ]},
  FieldGroup #FlightInformation : { Data : [
    { Value : airline,                  },
    { Value : to_Carrier.AirlinePicURL, },
    { Value : ConnectionID              },
    // Java doesn't work with these association paths
    // { Value : to_Flight.PlaneType       },
    // { Value : to_Flight.to_Connection.DepartureAirport.AirportID,
    //   Label: '{i18n>DepartureAirport}'          },
    // { Value : to_Flight.to_Connection.DestinationAirport.AirportID,
    //   Label: '{i18n>ArrivalAirport}'            },
    // { Value : to_Flight.to_Connection.Distance, },

    // Workaround:
    { Value : PlaneType       },
    { Value : DepAirport,     },
    { Value : DestAirport     },
    { Value : Distance,       },
  ]},
};

// determines the order of visual filters
annotate service.Bookings with @UI.SelectionFields : [
  FlightDate,
  status,
  airline
];
