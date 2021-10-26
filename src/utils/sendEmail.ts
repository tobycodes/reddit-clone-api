import nodemailer from "nodemailer";

async function sendEmail(to: string, html: string) {
  // Been trying all day but it never works
  try {
    const {
      user,
      pass,
      smtp: { host, port, secure },
    } = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure, // true for 465, false for other ports
      auth: { user, pass },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to, // list of receivers
      subject: "Reset your password",
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
  }
}

export { sendEmail };
