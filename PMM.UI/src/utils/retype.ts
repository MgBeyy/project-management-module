import dayjs from "dayjs";

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
    if (typeof status === 'string') return status;
    
    const statusMap: Record<number, string> = {
      0: "Planlandı",
      1: "Aktif",
      2: "Tamamlandı",
      3: "Beklemede",
    };
    
    return statusMap[status] || "Belirtilmemiş";
  };

  export const mapStatusToNumber = (status: string): number => {
    const reverseMap: Record<string, number> = {
      "Planlandı": 0,
      "Aktif": 1,
      "Tamamlandı": 2,
      "Beklemede": 3,
    };
    
    return reverseMap[status] ?? 0;
  };
