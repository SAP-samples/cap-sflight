using { Currency } from '../db/common';


// Workarounds for overly strict OData libs and clients
annotate cds.UUID with @UI.Hidden  @odata.Type : 'Edm.String';

annotate Currency with @Common.UnitSpecificScale : 'Decimals';
