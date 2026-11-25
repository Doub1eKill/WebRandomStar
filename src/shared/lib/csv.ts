/**
 * S2: spreadsheet apps treat a cell starting with = + - @ (or tab / CR) as a formula, so a
 * contestant name or question text could run a formula when the history CSV is opened.
 * Text cells that start like that get a leading apostrophe; numbers are left alone.
 */
// A lone "-" (used as a placeholder) is not a formula; "-" followed by anything can be.
const FORMULA_START = /^(?:[=+@\t\r]|-[\s\S])/;

export function toCsvCell(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return '""';
  let text = String(value);
  if (typeof value === 'string' && FORMULA_START.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}
