  export const formatDateTime = (dateString: string | number | null) => {
    if (!dateString || dateString === "-") return "-";
    try {
      // If it's a number (timestamp in milliseconds), convert it directly
      const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return "-";
      
      return date.toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString.toString();
    }
  };

  export const formatDate = (dateValue: string | number | null) => {
    if (!dateValue || dateValue === "-") return "-";
    try {
      // If it's a number (timestamp in milliseconds), convert it directly
      const date = typeof dateValue === 'number' ? new Date(dateValue) : new Date(dateValue);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return "-";
      
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateValue.toString();
    }
  };

  // Map status number to string
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

  // Map status string back to number for API
  export const mapStatusToNumber = (status: string): number => {
    const reverseMap: Record<string, number> = {
      "Planlandı": 0,
      "Aktif": 1,
      "Tamamlandı": 2,
      "Beklemede": 3,
    };
    
    return reverseMap[status] ?? 0;
  };
