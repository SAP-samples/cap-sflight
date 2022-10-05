using AnalyticsService as service from '../../srv/analytics-service';

annotate service.Bookings with {
  ID           @ID    : 'ID';
  rid          @title : 'Travel/BookingID';
  ConnectionID @title : 'ConnectionID';
  FlightDate   @title : 'FlightDate';
  price        @title : 'Price';
  status       @title : 'Status';
  airline      @title : 'Airline';
};

annotate service.Bookings with @(
  Common.SemanticKey : [ID],
  UI.LineItem        : [ // all fields used here must be listed below in "GroupableProperties", otherwise no content is shown
    {
      Value          : rid,
      @UI.Importance : #High,
    },
    {
      Value          : ConnectionID,
      @UI.Importance : #High,
    },
    {
      Value          : FlightDate,
      @UI.Importance : #High,
    },
    {
      Value          : price,
      @UI.Importance : #High,
    },
    {
      Value          : status,
      @UI.Importance : #High,
    },
    {
      Value          : airline,
      @UI.Importance : #High,
    },
  ],
);


annotate service.Bookings with @(Aggregation.ApplySupported : {
  Transformations        : [
    'aggregate',
    'topcount',
    'bottomcount',
    'identity',
    'concat',
    'groupby',
    'filter',
    'expand',
    'top',
    'skip',
    'orderby',
    'search'
  ],
  Rollup                 : #None,
  PropertyRestrictions   : true,
  GroupableProperties    : [
    rid,
    ConnectionID,
    FlightDate,
    price,
    cuco,
    status,
    airline,
  ],
  AggregatableProperties : [
    {Property : status, },
    {Property : price, },
    {Property : ID, },
  ],
});

annotate service.Bookings with @(Analytics.AggregatedProperties : [
  {
    Name                 : 'minPrice',
    AggregationMethod    : 'min',
    AggregatableProperty : 'price',
    @Common.Label        : 'Minimal Price'
  },
  {
    Name                 : 'maxPrice',
    AggregationMethod    : 'max',
    AggregatableProperty : 'price',
    @Common.Label        : 'Maximal Price'
  },
  {
    Name                 : 'avgPrice',
    AggregationMethod    : 'average',
    AggregatableProperty : 'price',
    @Common.Label        : 'Average Price'
  },
  {
    Name                 : 'sumPrice',
    AggregationMethod    : 'sum',
    AggregatableProperty : 'price',
    @Common.Label        : 'Total Price'
  },
  {
    Name                 : 'countBookings',
    AggregationMethod    : 'countdistinct',
    AggregatableProperty : 'ID',
    @Common.Label        : 'Number of Bookings'
  },
], );

annotate service.Bookings with @(UI.Chart : {
  Title               : 'Flight Bookings',
  ChartType           : #Column,
  Measures            : [sumPrice],
  Dimensions          : [status],
  MeasureAttributes   : [{
    $Type   : 'UI.ChartMeasureAttributeType',
    Measure : sumPrice,
    Role    : #Axis1
  }],
  DimensionAttributes : [{
    $Type     : 'UI.ChartDimensionAttributeType',
    Dimension : status,
    Role      : #Category
  }, ],
}, );


annotate service.Bookings with @(
  UI.PresentationVariant #pvAirline : {
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : price,
      Descending : true
    }, ],
    Visualizations : ['@UI.Chart#chartAirline']
  },
  UI.SelectionVariant #svAirline    : {SelectOptions : [{
    $Type        : 'UI.SelectOptionType',
    PropertyName : price,
    Ranges       : [{
      $Type  : 'UI.SelectionRangeType',
      Sign   : #I,
      Option : #GE,
      Low    : 0,
    }, ],
  }, ], },
  UI.Chart #chartAirline            : {
    $Type               : 'UI.ChartDefinitionType',
    ChartType           : #Bar,
    Dimensions          : [airline],
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : airline,
      Role      : #Category
    }],
    Measures            : [countBookings],
    MeasureAttributes   : [{
      $Type     : 'UI.ChartMeasureAttributeType',
      Measure   : countBookings,
      Role      : #Axis1,
      DataPoint : '@UI.DataPoint#dpAirline',
    }]
  },
  UI.DataPoint #dpAirline           : {
    Value : price,
    Title : 'Price'
  },
) {
  airline @(Common.ValueList #vlAirline : {
    Label                        : 'Airline',
    CollectionPath               : 'Bookings',
    SearchSupported              : true,
    PresentationVariantQualifier : 'pvAirline',
    SelectionVariantQualifier    : 'svAirline',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : airline,
      ValueListProperty : 'airline'
    }, ]
  });
};


annotate service.Bookings with @(
  UI.PresentationVariant #pvPrio : {
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : price,
      Descending : true
    }, ],
    Visualizations : ['@UI.Chart#chartPrio']
  },
  UI.SelectionVariant #svPrio    : {SelectOptions : [{
    $Type        : 'UI.SelectOptionType',
    PropertyName : price,
    Ranges       : [{
      $Type  : 'UI.SelectionRangeType',
      Sign   : #I,
      Option : #GE,
      Low    : 0,
    }, ],
  }, ], },
  UI.Chart #chartPrio            : {
    $Type               : 'UI.ChartDefinitionType',
    ChartType           : #Bar,
    Dimensions          : [status],
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : status,
      Role      : #Category
    }],
    Measures            : [countBookings],
    MeasureAttributes   : [{
      $Type     : 'UI.ChartMeasureAttributeType',
      Measure   : countBookings,
      Role      : #Axis1,
      DataPoint : '@UI.DataPoint#dpPrio',
    }]
  },
  UI.DataPoint #dpPrio           : {
    Value : price,
    Title : 'Price'
  },
) {
  status @(Common.ValueList #vlPrio : {
    Label                        : 'Status',
    CollectionPath               : 'Bookings',
    SearchSupported              : true,
    PresentationVariantQualifier : 'pvPrio',
    SelectionVariantQualifier    : 'svPrio',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : status,
      ValueListProperty : 'status'
    }, ]
  });
};


annotate service.Bookings with @(
  UI.PresentationVariant #pvPeriod : {
    Text           : 'FilterRisksOverPeriodPV',
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : FlightDate,
      Descending : true
    }, ],
    Visualizations : ['@UI.Chart#chartPeriod']
  },
  UI.Chart #chartPeriod            : {
    $Type               : 'UI.ChartDefinitionType',
    Title               : 'Risks Over Period',
    ChartType           : #Line,
    Dimensions          : [FlightDate],
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : FlightDate,
      Role      : #Category
    }],
    Measures            : [countBookings],
    MeasureAttributes   : [{
      $Type     : 'UI.ChartMeasureAttributeType',
      Measure   : countBookings,
      Role      : #Axis1,
      DataPoint : '@UI.DataPoint#dpPeriod',
    }]
  },
  UI.DataPoint #dpPeriod           : {
    Value : FlightDate,
    Title : 'Flight Date'
  },
) {
  FlightDate @(Common.ValueList #vlcreatedAt : {
    Label                        : 'Flight Date',
    CollectionPath               : 'Bookings',
    SearchSupported              : true,
    PresentationVariantQualifier : 'pvPeriod',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : FlightDate,
      ValueListProperty : 'FlightDate'
    }, ]
  });
};


// annotate service.Bookings with @(
//   UI.KPI #myKPI1 : {
//     DataPoint        : {
//       $Type            : 'UI.DataPointType',
//       Value            : price,
//       Title            : 'Field With Unit',
//       Description      : 'Field with a Unit',
//       Criticality      : criticality_code,
//       TrendCalculation : {
//         $Type                : 'UI.TrendCalculationType',
//         ReferenceValue       : targetValue,
//         StrongUpDifference   : 1000000,
//         UpDifference         : 100000,
//         DownDifference       : 0,
//         StrongDownDifference : -100000
//       },
//       TargetValue      : 45000000
//     },
//     Detail           : {
//       $Type                      : 'UI.KPIDetailType',
//       DefaultPresentationVariant : {
//         $Type          : 'UI.PresentationVariantType',
//         Visualizations : [
//           '@UI.Chart#kpi1',
//           ![@UI.LineItem]
//         ],
//       },
//     },
//     SelectionVariant : {
//       $Type         : 'UI.SelectionVariantType',
//       SelectOptions : [{
//         $Type        : 'UI.SelectOptionType',
//         PropertyName : countryCode,
//         Ranges       : [{
//           $Type  : 'UI.SelectionRangeType',
//           Sign   : #E,
//           Option : #EQ,
//           Low    : 0,
//         }, ],
//       }

//       ],
//     }
//   },

//   UI.Chart #kpi1 : {
//     $Type               : 'UI.ChartDefinitionType',
//     ChartType           : #Line,
//     Measures            : [fieldWithUnit],
//     Dimensions          : [dimensions],
//     MeasureAttributes   : [{
//       $Type   : 'UI.ChartMeasureAttributeType',
//       Measure : fieldWithUnit,
//       Role    : #Axis1
//     }],
//     DimensionAttributes : [{
//       $Type     : 'UI.ChartDimensionAttributeType',
//       Dimension : dimensions,
//       Role      : #Category
//     }]
//   },
// );
