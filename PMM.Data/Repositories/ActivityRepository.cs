using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class ActivityRepository : _BaseRepository<Activity>, IActivityRepository
    {
        public ActivityRepository(ApplicationDbContext context, ILogger<ActivityRepository> logger)
            : base(context, logger)
        {
        }

        public async Task<bool> HasConflictingActivityAsync(int userId, DateTime startTime, DateTime endTime, int? excludeActivityId = null)
        {
            var query = Query(a => a.UserId == userId && a.StartTime < endTime && a.EndTime > startTime);
            if (excludeActivityId.HasValue)
            {
                query = query.Where(a => a.Id != excludeActivityId.Value);
            }
            return await query.AnyAsync();
        }
    }
}
