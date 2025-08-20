using { Currency } from '../db/common';


// Workarounds for overly strict OData libs and clients
annotate cds.UUID with @UI.Hidden;

annotate Currency with @Common.UnitSpecificScale : 'Decimals';
