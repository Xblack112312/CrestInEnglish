// lib/email.ts
import DropboxResetPasswordEmail from "@/emails/resetPassword";
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API!);

export async function sendResetEmail(email: string, username: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "CrestSupport <no-reply@crestinenglish.online>",
    to: email,
    subject: "Reset your password",
    react: DropboxResetPasswordEmail({ userFirstname: username, resetPasswordLink: resetUrl }),
  });
}
