import React, { useState } from 'react';
import AuthService from '../services/AuthService';
import { Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const usernameValid = /^[a-zA-Z0-9]{3,16}$/.test(username.trim());
  const passwordValid = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!usernameValid) {
      setError('Username must be 3-16 letters or numbers.');
      return;
    }

    if (!passwordValid) {
      setError('Password must be at least 8 characters and include a number.');
      return;
    }

    try {
      setIsSubmitting(true);
      await AuthService.externalLogin(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  return (
    <div className="w-full max-w-md rounded-2xl p-8 shadow-xl backdrop-blur reveal glass-panel">
      <Toaster />
      <div className="flex flex-col items-center text-center">
        <img alt="Salvation Logo" src="logo.webp" className="h-28 w-auto" />
        <p className="section-kicker mt-5 text-xs uppercase tracking-[0.4em] text-yellow-500">Welcome Back</p>
        <h1 className="mt-3 text-3xl font-extrabold text-white hero-title">Enter the Sanctum</h1>
        <p className="mt-2 text-sm text-gray-300">Return to your legend and continue the journey.</p>
      </div>

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <div>
          <label htmlFor="username" className="block text-xs uppercase tracking-[0.3em] text-gray-400">
            Username
          </label>
          <div className="mt-2">
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={handleUsernameChange}
              className="block w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your username"
            />
          </div>
          {!usernameValid && username.length > 0 && (
            <p className="mt-2 text-xs text-yellow-200">Use 3-16 letters or numbers only.</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs uppercase tracking-[0.3em] text-gray-400">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-yellow-300 hover:text-yellow-200">
              Forgot password?
            </Link>
          </div>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              className="block w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your password"
            />
          </div>
          {!passwordValid && password.length > 0 && (
            <p className="mt-2 text-xs text-yellow-200">Use 8+ characters with at least one number.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white ${
              isSubmitting ? 'bg-gray-700 text-gray-300' : 'action-primary'
            }`}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
          <Link
            to="/register"
            className="flex w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold text-yellow-200 action-ghost"
          >
            Create a new account
          </Link>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Not a member?{' '}
        <Link to="/register" className="font-semibold text-yellow-300 hover:text-yellow-200">
          Register now and join the adventure.
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
