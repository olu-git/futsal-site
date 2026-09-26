import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <section className="admin-auth-page">
      <div className="admin-auth-card">
        <p className="eyebrow">Restricted access</p>
        <h1>FIS Admin</h1>
        <p>Sign in with your authorised administrator account.</p>
        <LoginForm />
      </div>
    </section>
  );
}
