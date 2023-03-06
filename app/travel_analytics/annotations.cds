using AnalyticsService as service from '../../srv/analytics-service';

annotate service.Bookings with @(
  Aggregation.CustomAggregate #price : 'Edm.Decimal',
  Aggregation.CustomAggregate #cuco : 'Edm.String',
  Common.SemanticKey : [ID],
) {
  ID    @ID : 'ID';
  price /*@Analytics.Measure: true*/ @Aggregation.default: #SUM;
  cuco  /*@Analytics.Measure: true*/ @Aggregation.default: #MAX;
};

annotate service.Bookings with @Aggregation.ApplySupported : {
  // Transformations : [
  //   'aggregate',
  //   'topcount',
  //   'bottomcount',
  //   'identity',
  //   'concat',
  //   'groupby',
  //   'filter',
  //   'expand',
  //   'top',
  //   'skip',
  //   'orderby',
  //   'search'
  // ],
  //Rollup               : #None,
  //PropertyRestrictions : true,
  GroupableProperties  : [
    TravelID,
    BookingID,
    CombinedID,
    ConnectionID,
    FlightDate,
    cuco,
    status,
    airline,
  ],
  AggregatableProperties : [
    {Property : status },
    {Property : price },
    {Property : ID },
  ],
};

annotate service.Bookings with @(Analytics.AggregatedProperty #countBookings :
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
    AggregatableProperty : price,
    @Common.Label        : '{i18n>MinPrice}'
  },
  Analytics.AggregatedProperty #maxPrice :
    {
    Name                 : 'maxPrice',
    AggregationMethod    : 'max',
    AggregatableProperty : price,
    @Common.Label        : '{i18n>MaxPrice}'
  },
   Analytics.AggregatedProperty #avgPrice :
   {
    Name                 : 'avgPrice',
    AggregationMethod    : 'average',
    AggregatableProperty : price,
    @Common.Label        : '{i18n>AvgPrice}'
  },
  // measure "sum of prices" is available by default (but name/label doesn't indicate summing -> ?)
  // Analytics.AggregatedProperty #sumPrice :
  //  {
  //   Name                 : 'sumPrice',
  //   AggregationMethod    : 'sum',
  //   AggregatableProperty : price,
  //   @Common.Label        : '{i18n>TotalPrice}'
  // }
);

// annotate service.Bookings with @Analytics.AggregatedProperties : [
//   {
//     Name                 : 'minPrice',
//     AggregationMethod    : 'min',
//     AggregatableProperty : price,
//     @Common.Label        : '{i18n>MinPrice}'
//   }, {
//     Name                 : 'maxPrice',
//     AggregationMethod    : 'max',
//     AggregatableProperty : price,
//     @Common.Label        : '{i18n>MaxPrice}'
//   }, {
//     Name                 : 'avgPrice',
//     AggregationMethod    : 'average',
//     AggregatableProperty : price,
//     @Common.Label        : '{i18n>AvgPrice}'
//   },
//    {
//     Name                 : 'sumPrice',
//     AggregationMethod    : 'sum',
//     AggregatableProperty : price,
//     @Common.Label        : '{i18n>TotalPrice}'
//   },
//   {
//     Name                 : 'countBookings',
//     AggregationMethod    : 'countdistinct',
//     AggregatableProperty : ID,
//     @Common.Label        : '{i18n>Bookings}'
//   }
// ];

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
    Value          : price,
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
  //Measures            : [minPrice, avgPrice, maxPrice],   // replaced by DynamicMeasures
  DynamicMeasures : [
    '@Analytics.AggregatedProperty#minPrice',
    '@Analytics.AggregatedProperty#maxPrice',
    '@Analytics.AggregatedProperty#avgPrice'
  ],
  Dimensions          : [airline],
  MeasureAttributes   : [{
    //Measure : minPrice,   // replaced by DynamicMeasure
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
    price
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
    //Measures            : [countBookings],   // replaced by DynamicMeasures
    DynamicMeasures : [
      '@Analytics.AggregatedProperty#countBookings',
    ],
    Dimensions          : [airline],
    MeasureAttributes   : [{
      //Measure   : countBookings,   // replaced by DynamicMeasure
      DynamicMeasure : '@Analytics.AggregatedProperty#countBookings',
      Role      : #Axis1,
    }],
    DimensionAttributes : [{
      Dimension : airline,
      Role      : #Category
    }],
  }
) {
  airline @Common.ValueList #vlAirline : {
    //Label                        : 'Airline',
    CollectionPath               : 'Bookings',
    //SearchSupported              : true,
    PresentationVariantQualifier : 'pvAirline',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : airline,
      ValueListProperty : 'airline'
    }]
  };
};


annotate service.Bookings with @(
  UI.PresentationVariant #pvStatus : {
    // SortOrder      : [{
    //   Property   : price,
    //   Descending : true
    // }],
    Visualizations : ['@UI.Chart#chartStatus']
  },
  // UI.SelectionVariant #svStatus : {
  //   SelectOptions : [{
  //     PropertyName : status,
  //     Ranges       : [{
  //       Sign   : #I,
  //       Option : #EQ,
  //       Low    : 'N',
  //     }]
  //   }]
  // },
  UI.Chart #chartStatus : {
    ChartType           : #Bar,
   //Measures            : [countBookings],   // replaced by DynamicMeasures
    DynamicMeasures : [
      '@Analytics.AggregatedProperty#countBookings',
    ],
    Dimensions          : [status],
    MeasureAttributes   : [{
      //Measure   : countBookings,   // replaced by DynamicMeasure
      DynamicMeasure : '@Analytics.AggregatedProperty#countBookings',
      Role      : #Axis1,
    }],
    DimensionAttributes : [{
      Dimension : status,
      Role      : #Category
    }]
  }
) {
  status @Common.ValueList #vlStatus : {
    //Label                        : 'Status',
    CollectionPath               : 'Bookings',
    //SearchSupported              : true,
    PresentationVariantQualifier : 'pvStatus',
    //SelectionVariantQualifier    : 'svStatus',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : status,
      ValueListProperty : 'status'
    }]
  };
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
    //Measures            : [countBookings],   // replaced by DynamicMeasures
    DynamicMeasures : [
      '@Analytics.AggregatedProperty#countBookings',
    ],
    Dimensions          : [FlightDate],
    MeasureAttributes   : [{
      //Measure   : countBookings,   // replaced by DynamicMeasure
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
    //Label                        : '{i18n>FlightDate}',
    CollectionPath               : 'Bookings',
    //SearchSupported              : true,
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
      Value            : price,
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
        PropertyName : price,
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
    Measures          : [price],
    Dimensions        : [FlightDate],
    MeasureAttributes : [{
      Measure : price,
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
    { Value : price                     },
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
