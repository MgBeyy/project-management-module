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

        public async Task<bool> HasConflictingActivityAsync(int? userId, int? machineId, DateTime startTime, DateTime endTime, int? excludeActivityId = null)
        {
            var query = Query(a => a.StartTime < endTime && a.EndTime > startTime);
            if (userId.HasValue)
            {
                query = query.Where(a => a.UserId == userId.Value);
            }
            if (machineId.HasValue)
            {
                query = query.Where(a => a.MachineId == machineId.Value);
            }
            if (excludeActivityId.HasValue)
            {
                query = query.Where(a => a.Id != excludeActivityId.Value);
            }
            return await query.AnyAsync();
        }
    }
}
