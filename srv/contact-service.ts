import cds from '@sap/cds';
import { ContactRequests } from '#cds-models/company/contactform'; // Adjust if path is different after generation

export class ContactService extends cds.ApplicationService {
  async init() {
    this.after('CREATE', 'ContactRequests', async (data: ContactRequests, req: cds.Request) => {
      console.log('New contact form submission received:');
      console.log('Name:', data.name);
      console.log('Email:', data.email);
      if (data.company) console.log('Company:', data.company);
      if (data.phone) console.log('Phone:', data.phone);
      console.log('Message:', data.message);
      console.log('Created At:', data.createdAt);

      // Placeholder for email sending logic
      const emailTarget = 'subscriber@company.com';
      console.log(`TODO: Send email with the above details to ${emailTarget}`);

      // Here you would typically use a library like nodemailer
      // and configure it with SMTP server details (e.g., from environment variables or a bound service)
      // Example (conceptual, actual implementation requires nodemailer and config):
      //
      // import nodemailer from 'nodemailer';
      // const transporter = nodemailer.createTransport({
      //   host: process.env.SMTP_HOST,
      //   port: process.env.SMTP_PORT,
      //   secure: false, // true for 465, false for other ports
      //   auth: {
      //     user: process.env.SMTP_USER,
      //     pass: process.env.SMTP_PASS,
      //   },
      // });
      //
      // try {
      //   await transporter.sendMail({
      //     from: '"Contact Form" <noreply@company.com>',
      //     to: emailTarget,
      //     subject: 'New Contact Form Submission',
      //     text: `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || ''}\nPhone: ${data.phone || ''}\nMessage: ${data.message}`,
      //     html: `<p>Name: ${data.name}</p><p>Email: ${data.email}</p><p>Company: ${data.company || ''}</p><p>Phone: ${data.phone || ''}</p><p>Message: ${data.message}</p>`,
      //   });
      //   console.log('Email sent (simulated).');
      // } catch (error) {
      //   console.error('Error sending email (simulated):', error);
      // }
    });

    await super.init();
  }
}
