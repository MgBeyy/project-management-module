using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Core.Mappers
{
    public class ActivityMapper
    {
        private static DateTime RoundToNearest15Minutes(DateTime dateTime)
        {
            var utcDateTime = dateTime.ToUniversalTime();

            var minutes = utcDateTime.Minute;
            var roundedMinutes = (int)Math.Round(minutes / 15.0) * 15;

            if (roundedMinutes == 60)
            {
                return new DateTime(utcDateTime.Year, utcDateTime.Month, utcDateTime.Day, utcDateTime.Hour, 0, 0, DateTimeKind.Utc)
                    .AddHours(1);
            }

            return new DateTime(utcDateTime.Year, utcDateTime.Month, utcDateTime.Day, utcDateTime.Hour, roundedMinutes, 0, DateTimeKind.Utc);
        }

        public static Activity Map(CreateActivityForm form)
        {
            var roundedStartTime = RoundToNearest15Minutes(form.StartTime);

            var roundedEndTime = RoundToNearest15Minutes(form.EndTime);

            if (roundedEndTime <= roundedStartTime)
            {
                roundedEndTime = roundedStartTime.AddMinutes(15);
            }

            var totalHours = (decimal)(roundedEndTime - roundedStartTime).TotalHours;

            return new Activity
            {
                TaskId = form.TaskId,
                UserId = form.UserId,
                MachineId = form.MachineId,
                Description = form.Description,
                StartTime = roundedStartTime,
                EndTime = roundedEndTime,
                TotalHours = totalHours,
                IsLast = form.IsLast
            };
        }

        public static ActivityDto Map(Activity activity)
        {
            return new ActivityDto
            {
                Id = activity.Id,
                TaskId = activity.TaskId,
                UserId = activity.UserId,
                MachineId = activity.MachineId,
                Description = activity.Description,
                StartTime = activity.StartTime,
                EndTime = activity.EndTime,
                TotalHours = activity.TotalHours,
                IsLast = activity.IsLast,
                CreatedAt = activity.CreatedAt,
                CreatedById = activity.CreatedById,
                UpdatedAt = activity.UpdatedAt,
                UpdatedById = activity.UpdatedById
            };
        }

        public static List<ActivityDto> Map(List<Activity> activities)
        {
            return activities.Select(Map).ToList();
        }

        public static Activity Map(UpdateActivityForm form, Activity activity)
        {
            var roundedStartTime = RoundToNearest15Minutes(form.StartTime);

            var roundedEndTime = RoundToNearest15Minutes(form.EndTime);

            if (roundedEndTime <= roundedStartTime)
            {
                roundedEndTime = roundedStartTime.AddMinutes(15);
            }

            activity.Description = form.Description;
            activity.StartTime = roundedStartTime;
            activity.EndTime = roundedEndTime;
            activity.TotalHours = (decimal)(roundedEndTime - roundedStartTime).TotalHours;
            activity.IsLast = form.IsLast;

            return activity;
        }
    }
}
