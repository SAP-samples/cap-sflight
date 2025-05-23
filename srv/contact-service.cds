using { company.contactform as cf } from '../db/contact-schema';

service ContactService @(path:'/public/contact') {
  @restrict: [
    { grant: 'WRITE', to: '*' } // Allow anyone to submit the form
    // No explicit READ grant means it's not publicly readable by default
  ]
  entity ContactRequests as projection on cf.ContactRequests;
}
