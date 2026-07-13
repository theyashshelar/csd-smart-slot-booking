/**
 * Formats a 24-hour time string (e.g. "09:00", "09:00:00", "14:00") into a 12-hour AM/PM format (e.g. "09:00 AM", "02:00 PM").
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  // Check if it already contains AM/PM to prevent double formatting
  if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
    return timeStr.trim();
  }
  const cleanStr = timeStr.trim();
  // Match HH:MM(:SS)?
  const match = cleanStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) {
    return cleanStr;
  }
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hourStr = hours < 10 ? `0${hours}` : `${hours}`;
  return `${hourStr}:${minutes} ${ampm}`;
}

/**
 * Formats a slot label or range (e.g. "09:00-10:00" or "09:00 - 10:00") into a 12-hour AM/PM range (e.g. "09:00 AM – 10:00 AM").
 */
export function formatSlotLabel(label: string): string {
  if (!label) return '';
  // Check if it already contains AM/PM to prevent double formatting
  if (label.toUpperCase().includes('AM') || label.toUpperCase().includes('PM')) {
    return label.trim();
  }
  // Try to split on common delimiters (hyphen, en-dash, em-dash)
  const parts = label.split(/\s*[-–—]\s*/);
  if (parts.length === 2) {
    const start = formatTime12h(parts[0]);
    const end = formatTime12h(parts[1]);
    if (start !== parts[0] || end !== parts[1]) {
      return `${start} – ${end}`;
    }
  }
  const formattedSingle = formatTime12h(label);
  if (formattedSingle !== label) {
    return formattedSingle;
  }
  return label;
}
