using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface IActivityRepository : _IBaseRepository<Activity>
    {
    }

    public class ActivityRepository : _BaseRepository<Activity>, IActivityRepository
    {
        public ActivityRepository(ApplicationDbContext context, ILogger<ActivityRepository> logger)
            : base(context, logger)
        {
        }
    }
}
