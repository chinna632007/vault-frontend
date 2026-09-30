/**
 * Shared storage formatting utilities.
 * Ensures consistent storage display across all pages (dashboard, profile, settings, wallet, sidebar).
 *
 * Convention: 1 GB = 1024 MB, 1 MB = 1024 KB (binary units, consistent with the rest of the codebase).
 */

/**
 * Parse a human-readable size string (e.g. "1.5 GB", "500 MB", "1024 KB") into a number of MB.
 * Falls back to treating the raw number as MB if no unit is recognised.
 *
 * @param {string|number} sizeStr - The size string or number to parse.
 * @returns {number} Size in MB (0 if input is empty/invalid).
 */
export const parseSizeToMB = (sizeStr) => {
  if (sizeStr === null || sizeStr === undefined) return 0;
  const s = sizeStr.toString().toUpperCase().trim();
  if (!s) return 0;
  const num = parseFloat(s) || 0;
  if (s.includes("GB")) return num * 1024;
  if (s.includes("MB")) return num;
  if (s.includes("KB")) return num / 1024;
  // No unit recognised – assume the raw number is already in MB
  return num;
};

/**
 * Format a number of megabytes into a compact human-readable string.
 *   - >= 1024 MB  -> "X.XX GB"
 *   - >= 1 MB     -> "X.XX MB"
 *   - < 1 MB      -> "X KB"
 *
 * @param {number} mb - Size in megabytes.
 * @returns {string} Formatted size string, e.g. "1.30 GB" or "500.00 MB".
 */
export const formatMB = (mb) => {
  const num = parseFloat(mb) || 0;
  if (num >= 1024) return `${(num / 1024).toFixed(2)} GB`;
  if (num >= 1) return `${num.toFixed(2)} MB`;
  return `${(num * 1024).toFixed(0)} KB`;
};

/**
 * Parse a size string (e.g. "1336.0 MB") and format it into a compact human-readable string.
 * This is a convenience wrapper around parseSizeToMB + formatMB.
 *
 * @param {string|number} sizeStr - The size string to format.
 * @returns {string} Formatted size string, e.g. "1.30 GB" or "0 MB" for empty input.
 */
export const formatStorageSize = (sizeStr) => {
  if (sizeStr === null || sizeStr === undefined || sizeStr === "") return "0 MB";
  return formatMB(parseSizeToMB(sizeStr));
};