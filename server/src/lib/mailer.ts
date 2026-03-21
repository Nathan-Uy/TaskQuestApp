import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (to: string, resetUrl: string) => {
  await transporter.sendMail({
    from: `"TaskQuest" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your TaskQuest password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 24px; color: #1a1714; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #6b6560; font-size: 14px; margin-bottom: 24px;">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        
          href="${resetUrl}"
          style="display: inline-block; background: #c2622a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;"
        >
          Reset Password
        </a>
        <p style="color: #a09890; font-size: 12px; margin-top: 24px;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};
