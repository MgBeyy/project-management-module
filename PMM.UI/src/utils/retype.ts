import dayjs, { Dayjs } from "dayjs";
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const parseDate = (dateValue: any): dayjs.Dayjs | null => {
  if (!dateValue) return null;

  // If it's already a dayjs object, return it
  if (dayjs.isDayjs(dateValue)) return dateValue;

  // If it's a string, try to parse it as DD.MM.YYYY format
  if (typeof dateValue === 'string') {
    const parsed = dayjs(dateValue, "DD.MM.YYYY", true);
    if (parsed.isValid()) return parsed;

    // Fallback to ISO parsing
    const isoParsed = dayjs(dateValue);
    if (isoParsed.isValid()) return isoParsed;
  }

  return null;
};

export const formatDateTime = (dateString: string | number | null) => {
  if (!dateString || dateString === "-") return null;
  try {
    let date: dayjs.Dayjs | null = null;

    if (typeof dateString === 'number') {
      date = dayjs(dateString);
    } else {
      // Try DD.MM.YYYY format first
      const ddmmyyyy = dayjs(dateString, "DD.MM.YYYY", true);
      if (ddmmyyyy.isValid()) {
        date = ddmmyyyy;
      } else {
        // Fallback to ISO or other formats
        date = dayjs(dateString);
      }
    }

    if (!date || !date.isValid()) return null;

    return date.format("DD.MM.YYYY HH:mm");
  } catch {
    return null;
  }
};

export const formatDate = (dateValue: string | number | null) => {
  if (!dateValue || dateValue === "-") return null;
  try {
    let date: dayjs.Dayjs | null = null;

    if (typeof dateValue === 'number') {
      date = dayjs(dateValue);
    } else {
      // Try DD.MM.YYYY format first
      const ddmmyyyy = dayjs(dateValue, "DD.MM.YYYY", true);
      if (ddmmyyyy.isValid()) {
        date = ddmmyyyy;
      } else {
        // Fallback to ISO or other formats
        date = dayjs(dateValue);
      }
    }

    if (!date || !date.isValid()) return null;

    return date.format("DD.MM.YYYY");
  } catch {
    return null;
  }
};

export const mapStatusToString = (status: number | string): string => {
  if (typeof status === 'string') {
    switch (status) {
      case "Planned":
        return "Planlandı";
      case "Active":
        return "Aktif";
      case "Completed":
        return "Tamamlandı";
      case "Inactive":
        return "Pasif";
      default:
        return "Belirtilmemiş";
    }
  }

  const statusMap: Record<number, string> = {
    0: "Planlandı",
    1: "Aktif",
    2: "Tamamlandı",
    3: "Pasif",
  };

  return statusMap[status] || "Belirtilmemiş";
};

export const mapStatusToNumber = (status: string): number => {
  const reverseMap: Record<string, number> = {
    "Planlandı": 0,
    "Aktif": 1,
    "Tamamlandı": 2,
    "Pasif": 3,
  };

  return reverseMap[status] ?? 0;
};


// YYYY-MM-DD yerine ms (number) kullanacağız
export const toMillis = (d?: Dayjs | string | number | null): number | null => {
  if (d == null) return null;

  // If it's already a number, assume it's milliseconds
  if (typeof d === "number") {
    return Number.isNaN(d) ? null : d;
  }

  // Resolve to a Dayjs instance from string or Dayjs
  let v: Dayjs;
  if (typeof d === "string") {
    // Try common date-only formats first (strict), then fallback to general parsing
    const ddmmyyyy = dayjs(d, "DD.MM.YYYY", true);
    const ddmmyyyyDash = dayjs(d, "DD-MM-YYYY", true);
    const iso = dayjs(d);
    if (ddmmyyyy.isValid()) v = ddmmyyyy;
    else if (ddmmyyyyDash.isValid()) v = ddmmyyyyDash;
    else if (iso.isValid()) v = iso;
    else return null;
  } else if (dayjs.isDayjs(d)) {
    v = d;
  } else {
    // Fallback: try to construct a dayjs from the value
    v = dayjs(d as any);
  }

  if (!v || !v.isValid()) return null;

  // Convert to UTC midnight (00:00) for the given date and return milliseconds
  // This ensures selected dates (which are typically date-only) are sent as UTC0 ms
  const utcStartOfDay = dayjs.utc(v.format("YYYY-MM-DD")).startOf("day");
  return utcStartOfDay.valueOf();
};

export const fromMillis = (ms?: number | string | null): Dayjs | undefined => {
  if (ms == null) return undefined;
  const n = typeof ms === "string" ? Number(ms) : ms;
  if (Number.isNaN(n)) return undefined;
  const d = dayjs(n);
  return d.isValid() ? d : undefined;
};


export const fromISODate = (s?: string | null): Dayjs | undefined => {
  if (!s) return undefined;
  const d = dayjs(s);
  return d.isValid() ? d : undefined;
};

export const coerceNumberArray = (arr: Array<string | number> | null | undefined): number[] | undefined => {
  if (!arr || !Array.isArray(arr)) return undefined;
  const unique = new Set<number>();
  arr.forEach((v) => {
    const n = typeof v === "string" ? Number(v) : v;
    if (!Number.isNaN(n)) unique.add(n);
  });
  return Array.from(unique);
};