import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset admin password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return <section className="admin-auth-page"><div className="admin-auth-card">
    <p className="eyebrow">FIS Admin</p>
    <h1>Reset password</h1>
    <ResetPasswordForm />
  </div></section>;
}
