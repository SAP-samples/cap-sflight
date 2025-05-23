namespace company.contactform;

using { cuid, managed } from '@sap/cds/common';

entity ContactRequests : cuid, managed {
  name    : String(100) not null;
  email   : String(100) not null @(assert.format: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  company : String(100);
  phone   : String(50);
  message : LargeString not null;
}
