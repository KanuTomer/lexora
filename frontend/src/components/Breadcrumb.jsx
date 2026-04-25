import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="mb-4 flex items-center gap-1 text-sm text-muted" aria-label="Breadcrumb">
      <Link className="inline-flex items-center gap-1 hover:text-blue-700" to="/dashboard">
        <Home className="h-4 w-4" aria-hidden="true" />
        Dashboard
      </Link>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          {item.to ? (
            <Link className="hover:text-blue-700" to={item.to}>
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
