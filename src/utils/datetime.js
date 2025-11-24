// Date & time utilities (additive). Keeps original formatDateForTable for reuse.
export const formatDateForTable = (input) => {
  if (!input) return "-";
  if (typeof input === "string") {
    const pureDateMatch = input.match(/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/);
    if (pureDateMatch) return input;
    const isoDateOnly = input.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
    if (isoDateOnly) {
      const [, y, m, d] = isoDateOnly;
      return `${d}/${m}/${y}`;
    }
  }
  const dateObj = input instanceof Date ? input : new Date(input);
  if (isNaN(dateObj.getTime())) return "-";
  const pad = (n) => String(n).padStart(2, "0");
  const d = pad(dateObj.getDate());
  const m = pad(dateObj.getMonth() + 1);
  const y = dateObj.getFullYear();
  const hh = pad(dateObj.getHours());
  const mm = pad(dateObj.getMinutes());
  if (typeof input === "string" && /T/.test(input) === false && hh === "00" && mm === "00") {
    return `${d}/${m}/${y}`;
  }
  return `${d}/${m}/${y} ${hh}:${mm}`;
};
