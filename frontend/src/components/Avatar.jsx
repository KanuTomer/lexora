import { useEffect, useMemo, useState } from "react";
import { getFileUrl } from "../services/api.js";

export default function Avatar({ user, size = "md", className = "" }) {
  const dimensions = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-20 w-20 text-2xl",
  };
  const [hasImageError, setHasImageError] = useState(false);
  useEffect(() => {
    setHasImageError(false);
  }, [user?.avatarUrl]);
  const initials = useMemo(
    () =>
      user?.name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
      || user?.username?.slice(0, 2)?.toUpperCase()
      || "U",
    [user?.name, user?.username],
  );
  const avatarSrc = !hasImageError ? getFileUrl(user?.avatarUrl) : null;

  if (avatarSrc) {
    return (
      <img
        className={`${dimensions[size]} rounded-full border border-line object-cover bg-surface ${className}`}
        src={avatarSrc}
        alt={user.name ?? "User avatar"}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <span
      className={`${dimensions[size]} inline-flex items-center justify-center rounded-full border border-line bg-surface font-semibold text-muted ${className}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
