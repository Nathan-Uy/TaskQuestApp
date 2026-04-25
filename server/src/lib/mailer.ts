import nodemailer from "nodemailer";

const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export const sendMail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"TaskQuest" <${process.env.EMAIL_USER}>`,
    ...options,
  });
};

export const sendResetEmail = async (to: string, resetUrl: string) => {
  await sendMail({
    to,
    subject: "Reset your TaskQuest password",
    html: buildResetHtml(resetUrl),
  });
};

export const sendInviteEmail = async (options: {
  to: string;
  inviteeName: string;
  teamName: string;
  projectName: string;
  inviterName: string;
  acceptUrl: string;
}) => {
  await sendMail({
    to: options.to,
    subject: `You've been invited to join ${options.teamName} on TaskQuest`,
    html: buildInviteHtml(options),
  });
};

const buildInviteHtml = (options: {
  inviteeName: string;
  teamName: string;
  projectName: string;
  inviterName: string;
  acceptUrl: string;
}) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9f7f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">
          <tr>
            <td style="background:#c2622a;padding:24px 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:20px;color:#ffffff;font-weight:bold;">TaskQuest</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px 0;font-family:Georgia,serif;font-size:22px;color:#1a1714;">You've been invited!</h2>
              <p style="margin:0 0 24px 0;font-size:14px;color:#6b6560;line-height:1.6;">
                Hi <strong>${options.inviteeName}</strong>,<br><br>
                <strong>${options.inviterName}</strong> has invited you to join the team
                <strong>${options.teamName}</strong> on the project <strong>${options.projectName}</strong>.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:#c2622a;">
                    <a href="${options.acceptUrl}" target="_blank"
                      style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
                      Accept Invitation →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0 0;font-size:12px;color:#a09890;line-height:1.5;">
                If you don't have a TaskQuest account yet, you'll be prompted to create one when you click the link.
              </p>
              <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;">
              <p style="margin:0;font-size:11px;color:#c0bab5;">
                If the button doesn't work, copy and paste this link:<br>
                <a href="${options.acceptUrl}" style="color:#c2622a;word-break:break-all;">${options.acceptUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f7f5;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a09890;">© 2026 TaskQuest. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const buildResetHtml = (resetUrl: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9f7f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">
          <tr>
            <td style="background:#c2622a;padding:24px 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:20px;color:#ffffff;font-weight:bold;">TaskQuest</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px 0;font-family:Georgia,serif;font-size:22px;color:#1a1714;">Reset your password</h2>
              <p style="margin:0 0 24px 0;font-size:14px;color:#6b6560;line-height:1.6;">
                We received a request to reset your TaskQuest password. Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:#c2622a;">
                    <a href="${resetUrl}" target="_blank"
                      style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0 0;font-size:12px;color:#a09890;line-height:1.5;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
              <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;">
              <p style="margin:0;font-size:11px;color:#c0bab5;">
                If the button doesn't work, copy and paste this link:<br>
                <a href="${resetUrl}" style="color:#c2622a;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f7f5;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a09890;">© 2026 TaskQuest. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
