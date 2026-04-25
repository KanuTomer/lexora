import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import { BookOpen, FolderKanban, UploadCloud } from "lucide-react";

const steps = [
  {
    title: "Join your academic space",
    description: "Set up your profile with your college, programme, semester, and subject context so the library stays useful from the start.",
    icon: BookOpen,
  },
  {
    title: "Upload the right material",
    description: "Share notes, assignments, test papers, and syllabi in the correct subject so classmates can discover them without guesswork.",
    icon: UploadCloud,
  },
  {
    title: "Learn from the library",
    description: "Search, preview, bookmark, and revisit material through a structured academic workspace built for repeated study.",
    icon: FolderKanban,
  },
];

function WhiteLogo({ className = "" }) {
  return (
    <span
      className={`block bg-white ${className}`}
      aria-label="Lexora"
      role="img"
      style={{
        WebkitMaskImage: "url('/lexora.svg')",
        maskImage: "url('/lexora.svg')",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <section
        className="relative overflow-hidden border-b border-line bg-[#4b1d9e] bg-no-repeat"
      >
        <div className="absolute inset-0">
          <img
            src="/landing-background.png"
            className="h-full w-full object-cover"
            alt=""
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-purple-500/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_42%)]" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-6 lg:gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8">
          <div className="max-w-lg text-white">
            <WhiteLogo className="h-14 w-64" />
            <h1 className="mt-8 text-4xl font-semibold leading-tight sm:text-5xl lg:text-5xl">
              Your Collaborative Hub for Sharing and Learning
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
              Lexora brings classmates, notes, and course resources into one calm library so sharing actually feels organized.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white hover:!text-black"
                to="/signup"
              >
                Get Started
              </Link>

              <Link
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition-colors duration-300 hover:bg-black hover:!text-white"
                to="/login"
              >
                Log in
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-center">
            <div className="absolute inset-0 flex justify-center">
                <div className="h-60 w-60 rounded-full bg-purple-400/30 blur-3xl" />
            </div>
            <div className="relative flex w-full max-w-2xl items-center justify-center rounded-2xl bg-white/10 p-6 backdrop-blur-md">
              <div className="w-full">
                <img
                  className="h-auto w-full object-contain"
                  src="/lexora-hero.png"
                  alt="Students exchanging academic material online"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold">A clean path from upload to discovery</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded border border-line bg-white p-5 shadow-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded border border-line bg-surface text-blue-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface/40">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">Features</p>
            <h2 className="mt-3 text-3xl font-semibold">A library shaped around academic context</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
              Files stay organized by programme, semester, subject, and type so the platform reads like a useful study tool instead of a pile of uploads.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-line bg-white p-5">
              <h3 className="text-base font-semibold">Preview before opening</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Quick previews, bookmarks, and search help students decide fast without leaving the flow.
              </p>
            </div>
            <div className="rounded border border-line bg-white p-5">
              <h3 className="text-base font-semibold">Moderated when needed</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Reporting, moderation, stale checks, and trusted uploads keep the library useful without cluttering normal browsing.
              </p>
            </div>
            <div className="rounded border border-line bg-white p-5 sm:col-span-2">
              <h3 className="text-base font-semibold">Built for repeated study sessions</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Dashboard, subject pages, profile uploads, and admin workflows all share the same calm, dense layout so the app stays predictable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <WhiteLogo className="h-10 w-48" />
            <p className="mt-3 text-sm text-white/70">
              A collaborative academic library for sharing, learning, and staying organized.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xl">
            <a className="transition hover:text-white/70" href="https://www.youtube.com/@adeadkid" target="_blank" rel="noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
            <a className="transition hover:text-white/70" href="https://www.linkedin.com/in/kanu-tomer/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a className="transition hover:text-white/70" href="https://github.com/KanuTomer" target="_blank" rel="noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a className="text-sm font-medium text-white/80 hover:text-white" href="https://github.com/your-org/lexora" target="_blank" rel="noreferrer">
              Project GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
