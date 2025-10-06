namespace PMM.Core.Helpers
{
    public static class WorkHoursCalculator
    {
        public static double CalculateWorkingHours(DateTime start, DateTime end)
        {
            if (end <= start) return 0;

            double totalHours = 0;
            var current = start;

            while (current.Date <= end.Date)
            {
                DateTime workStart, workEnd;

                switch (current.DayOfWeek)
                {
                    case DayOfWeek.Monday:
                    case DayOfWeek.Tuesday:
                    case DayOfWeek.Wednesday:
                    case DayOfWeek.Thursday:
                    case DayOfWeek.Friday:
                        workStart = current.Date.AddHours(8);
                        workEnd = current.Date.AddHours(18);
                        break;
                    case DayOfWeek.Saturday:
                        workStart = current.Date.AddHours(8);
                        workEnd = current.Date.AddHours(14);
                        break;
                    default: // Sunday
                        current = current.AddDays(1);
                        continue;
                }

                // Gün içinde başlangıç ve bitişi sınırla
                var effectiveStart = current > workStart ? current : workStart;
                var effectiveEnd = end < workEnd ? end : workEnd;

                if (effectiveEnd > effectiveStart)
                    totalHours += (effectiveEnd - effectiveStart).TotalHours;

                current = current.Date.AddDays(1).AddHours(0); // bir sonraki gün 00:00
            }

            return totalHours;
        }
    }
}
