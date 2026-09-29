import nodemailer from "nodemailer";

export interface SendPasscodeEmailOptions {
  toEmail: string;
  candidateName: string;
  passcode: string;
  deviceCount: number;
  durationMonths: number;
  amount: number;
  paymentRef: string;
}

/**
 * Helper utility to send email notifications for successful passcode purchases.
 * SMTP details are retrieved from environment variables. If missing, it logs
 * placeholder details without crashing.
 */
export async function sendPasscodePaymentEmail(options: SendPasscodeEmailOptions): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"CBT Terminal Passcodes" <noreply@cbtportal.ng>';

  console.log(`[SMTP Email Service Placeholder] Preparing email for ${options.toEmail}:`);
  console.log(`Candidate: ${options.candidateName} | Passcode: ${options.passcode} | Devices: ${options.deviceCount} | Amount: ₦${options.amount}`);

  if (!host || !user || !pass) {
    console.log("[SMTP Email Service Placeholder] SMTP credentials not fully configured in environment (SMTP_HOST, SMTP_USER, SMTP_PASS). Skipping live email dispatch.");
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const mailOptions = {
      from,
      to: options.toEmail,
      subject: `Passcode Receipt & Access Code - ${options.passcode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
          <h2 style="color: #1e3a8a; text-align: center;">Passcode Payment Receipt</h2>
          <p>Dear <strong>${options.candidateName}</strong>,</p>
          <p>Thank you for your passcode purchase. Below are your access details:</p>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 12px; text-transform: uppercase; color: #6b7280; display: block; margin-bottom: 5px;">Your Access Passcode</span>
            <span style="font-family: monospace; font-size: 28px; font-weight: bold; color: #047857; letter-spacing: 2px;">${options.passcode}</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Number of Devices:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${options.deviceCount} device(s)</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Duration:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${options.durationMonths} month(s)</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #047857;">₦${options.amount.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Payment Reference:</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px; text-align: right;">${options.paymentRef}</td></tr>
          </table>

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
            This is an automated receipt from the Examination Terminal Service.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[SMTP Email Service] Email sent successfully:", info.messageId);
    return true;
  } catch (err) {
    console.error("[SMTP Email Service] Failed to send email:", err);
    return false;
  }
}
