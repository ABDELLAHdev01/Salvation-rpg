import React from 'react'
import LoginForm from '../../shared/auth/LoginForm';

function LoginPage() {
  return (
    <section className="min-h-screen bg-page-primary dashboard-shell">
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <LoginForm />
      </div>
    </section>
  );
}
export default LoginPage
