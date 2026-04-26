import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const menuRef = useRef(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clearSession, currentUser } = useAuth();

  useEffect(() => {
    if (location.pathname === "/search") {
      setSearchValue(searchParams.get("q") ?? "");
    }
  }, [location.pathname, searchParams]);

  useEffect(() => {
    const term = searchValue.trim();
    if (!term) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, searchValue]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleLogout() {
    clearSession();
    setIsMenuOpen(false);
    navigate("/login");
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const term = searchValue.trim();

    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  }

  return (
    <header className="sticky top-0 z-20 grid h-14 grid-cols-[240px_minmax(280px,720px)_1fr] items-center gap-4 border-b border-line bg-white px-4">
      <Link to="/dashboard" className="flex min-w-0 items-center" aria-label="Lexora dashboard">
        <img className="h-6" src="/lexora.svg" alt="Lexora" />
      </Link>

      <form className="relative flex w-full items-center justify-self-center" onSubmit={handleSearchSubmit}>
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" aria-hidden="true" />
        <input
          className="h-10 w-full rounded border border-line bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:bg-white"
          placeholder="Search files, subject codes, or contributors"
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </form>

      <div className="flex items-center justify-end gap-3">
        <div ref={menuRef} className="relative">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:bg-surface"
            type="button"
            aria-label="Open profile menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <Avatar user={currentUser} size="sm" />
          </button>
          {isMenuOpen ? (
            <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded border border-line bg-white py-1 text-sm shadow-lg">
              <Link
                className="block px-3 py-2 text-ink hover:bg-surface"
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                className="block px-3 py-2 text-ink hover:bg-surface"
                to="/bookmarks"
                onClick={() => setIsMenuOpen(false)}
              >
                Bookmarks
              </Link>
              <Link
                className="block px-3 py-2 text-ink hover:bg-surface"
                to="/moderators"
                onClick={() => setIsMenuOpen(false)}
              >
                Moderators
              </Link>
              <Link
                className="block px-3 py-2 text-ink hover:bg-surface"
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {currentUser?.role === "moderator" ? (
                <Link
                  className="block px-3 py-2 text-ink hover:bg-surface"
                  to="/moderation"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Moderation Panel
                </Link>
              ) : null}
              <button
                className="block w-full px-3 py-2 text-left text-red-600 hover:bg-surface hover:!text-red-600"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
