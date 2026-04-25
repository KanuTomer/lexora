export default function FileSort({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      Sort
      <select
        className="h-9 rounded border border-line bg-white px-2 text-sm text-ink outline-none focus:border-blue-600"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="recent">Recent</option>
        <option value="downloads">Most downloaded</option>
      </select>
    </label>
  );
}
