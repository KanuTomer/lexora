const filters = [
  { label: "All", value: "all" },
  { label: "Notes", value: "notes" },
  { label: "Assignments", value: "assignment" },
  { label: "Test Papers", value: "test-paper" },
  { label: "Syllabus", value: "syllabus" },
];

export default function FileFilters({ activeFilter, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={[
            "h-9 rounded border px-3 text-sm font-medium",
            activeFilter === filter.value
              ? "border-blue-700 bg-blue-700 text-white"
              : "border-line bg-white text-muted hover:bg-surface hover:text-ink",
          ].join(" ")}
          type="button"
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
