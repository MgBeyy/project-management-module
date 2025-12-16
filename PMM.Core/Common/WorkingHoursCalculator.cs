using System;

namespace PMM.Core.Common
{
    public static class WorkingHoursCalculator
    {
        public static int CalculateWorkingHours(DateOnly startDate, DateOnly endDate, List<DateOnly> holidays = null)
        {
            if (startDate > endDate)
                throw new ArgumentException("Start date must be before or equal to end date.");

            if (holidays == null)
            {
                holidays = new List<DateOnly>
                {
                    new DateOnly(DateTime.Now.Year, 1, 1), // New Year's Day
                    new DateOnly(DateTime.Now.Year, 4, 23), // National Sovereignty and Children's Day
                    new DateOnly(DateTime.Now.Year, 5, 1), // Labour and Solidarity Day
                    new DateOnly(DateTime.Now.Year, 5, 19), // Commemoration of Atatürk, Youth and Sports Day
                    new DateOnly(DateTime.Now.Year, 7, 15), // Democracy and National Unity Day
                    new DateOnly(DateTime.Now.Year, 8, 30), // Victory Day
                    new DateOnly(DateTime.Now.Year, 10, 29), // Republic Day
                };
            }

            int totalHours = 0;
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (holidays.Contains(date))
                    continue;

                totalHours += date.DayOfWeek switch
                {
                    DayOfWeek.Monday => 8,
                    DayOfWeek.Tuesday => 8,
                    DayOfWeek.Wednesday => 8,
                    DayOfWeek.Thursday => 8,
                    DayOfWeek.Friday => 8,
                    DayOfWeek.Saturday => 5,
                    DayOfWeek.Sunday => 0,
                    _ => 0
                };
            }

            return totalHours;
        }
    }
}