using {TravelService} from '../../srv/travel-service';

annotate TravelService.Travel with @odata.draft.enabled;

annotate TravelService with @(
  Aggregation.ApplySupported.Rollup: #None,
  Aggregation.ApplySupported.Transformations: [
    'aggregate',
    'groupby',
    'filter'
  ],
  Common.ApplyMultiUnitBehaviorForSortingAndFiltering: true,
  Org.OData.Capabilities.V1.BatchSupport.ReferencesAcrossChangeSetsSupported: true
);
