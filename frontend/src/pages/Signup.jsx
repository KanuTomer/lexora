import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { signup } from "../services/api.js";

const usernamePattern = /^[a-z0-9._]+$/;

export default function Signup() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedUsername = username.trim().toLowerCase();
    if (!usernamePattern.test(normalizedUsername) || normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      setError("Username must be 3 to 30 characters and use only letters, numbers, dots, and underscores.");
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await signup({ username: normalizedUsername, email, password });
      setSession(session);
      navigate("/signup/details", { replace: true });
    } catch (signupError) {
      console.error("Signup failed", signupError);
      setError(signupError.response?.data?.message ?? "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Join the right library</p>
          <h1 className="mt-2 text-2xl font-semibold">Create your Lexora account</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Your college and program decide which subjects, notes, assignments, papers, and syllabi you see.
            You will choose that academic context in the next step before entering the dashboard.
          </p>
          <div className="mt-4 rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
            Usernames are public on uploads, so keep them simple: letters, numbers, dots, and underscores only.
          </div>
        </section>
        <form className="rounded border border-line bg-white p-5" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-muted">Step 1 of 2: secure your login.</p>
        {error ? <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="username">Username</label>
            <input
              id="username"
              className="h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600"
              value={username}
              autoComplete="username"
              placeholder="iitp_tester"
              onChange={(event) => setUsername(event.target.value.toLowerCase())}
            />
            <p className="mt-1 text-xs text-muted">3-30 characters. No spaces.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              className="h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              className="h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600"
              type="password"
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
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
        <p className="mt-4 text-sm text-muted">
          Already have an account? <Link className="font-medium text-blue-700 hover:underline" to="/login">Log in</Link>
        </p>
        </form>
      </div>
    </div>
  );
}
