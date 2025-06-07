import Nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import { MAILTRAP_INBOX_ID, MAILTRAP_SECRET } from "../constants/env";
import { SendEmailInput } from "../types/types";

const TOKEN = MAILTRAP_SECRET;
// const INBOX_ID = MAILTRAP_INBOX_ID;

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
    // testInboxId: parseInt(INBOX_ID),
  })
);

const sender = {
  address: "hello@example.com",
  name: "Mailtrap Test",
};

const recipients = ["iamfaisal.luv@gmail.com"];

export const sendEmail = async ({
  from,
  to,
  subject,
  text,
  category,
  sandbox,
}: SendEmailInput) => {
  try {
    const mail = await transport.sendMail({
      from,
      to,
      subject,
      text,
      category,
      sandbox,
    });
    return mail;
  } catch (error) {
    console.error(error);
  }
};
