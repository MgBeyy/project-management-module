using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Core.Mappers
{
    public class ActivityMapper
    {
        private static decimal RoundToNearestQuarter(decimal hours)
        {
            return Math.Round(hours * 4, MidpointRounding.AwayFromZero) / 4;
        }

        public static Activity Map(CreateActivityForm form)
        {
            var totalHours = (decimal)(form.EndTime - form.StartTime).TotalHours;

            return new Activity
            {
                TaskId = form.TaskId,
                UserId = form.UserId,
                Description = form.Description,
                StartTime = form.StartTime,
                EndTime = form.EndTime,
                TotalHours = RoundToNearestQuarter(totalHours)
            };
        }

        public static ActivityDto Map(Activity activity)
        {
            return new ActivityDto
            {
                Id = activity.Id,
                TaskId = activity.TaskId,
                UserId = activity.UserId,
                Description = activity.Description,
                StartTime = activity.StartTime,
                EndTime = activity.EndTime,
                TotalHours = activity.TotalHours,
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
            activity.Description = form.Description;
            activity.StartTime = form.StartTime;
            activity.EndTime = form.EndTime;
            activity.TotalHours = RoundToNearestQuarter((decimal)(form.EndTime - form.StartTime).TotalHours);
            return activity;
        }
    }
}
