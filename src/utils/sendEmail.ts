import * as nodemailer from 'nodemailer';
import { asyncError } from './asyncError';

const transporter = nodemailer.createTransport({
  port: 465,
  service: 'qq',
  secure: true,
  auth: {
    user: process.env.MY_EMAIL_ADDRESS,
    pass: process.env.MY_EMAIL_AUTH_CODE,
  },
});

export async function sendEmail(emailAddress: string, url: string) {
  const info = await transporter.sendMail({
    from: `"Fred Foo 👻" <${process.env.MY_EMAIL_ADDRESS}>`,
    to: process.env.MY_TEST_EMAIL_ADDRESS,
    subject: 'Confirm Email',
    html: `<html>
      <body>
        <p>Testing SparkPost - the world's most awesomest email service!</p>
        <a href="${url}">confirm email</a>
      </body>
    </html>`,
  });
  console.log('Message sent: %s', info.messageId);
}
