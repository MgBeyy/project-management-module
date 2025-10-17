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
    }
}
