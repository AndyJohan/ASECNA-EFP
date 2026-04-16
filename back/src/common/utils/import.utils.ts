export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function parseExcelTime(value: string | number | null) {
  const cleaned = String(value ?? '').trim();
  if (!cleaned) {
    return null;
  }

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(cleaned)) {
    return cleaned.length === 5 ? `${cleaned}:00` : cleaned;
  }

  const numeric = Number(cleaned.replace(',', '.'));
  if (Number.isNaN(numeric)) {
    return null;
  }

  const hours = Math.floor(numeric);
  const minutes = Math.round((numeric - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

export function buildIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
