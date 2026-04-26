import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { login } from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);
      const session = await login({ username, password });
      setSession(session);
      const from = location.state?.from?.pathname;
      const target = session.user?.role === "admin" ? "/admin" : from || "/dashboard";
      navigate(target, { replace: true });
    } catch (loginError) {
      console.error("Login failed", loginError);
      setError(loginError.response?.data?.message ?? "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form className="w-full max-w-md rounded border border-line bg-white p-5" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="mt-1 text-sm text-muted">Continue to Lexora.</p>
        {error ? <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="username">Username</label>
            <input
              id="username"
              className="h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              className="h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>
        <button
          className="mt-5 h-10 w-full rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
        <p className="mt-4 text-sm text-muted">
          New to Lexora? <Link className="font-medium text-blue-700 hover:underline" to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
