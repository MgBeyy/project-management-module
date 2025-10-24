using PMM.Domain.Entities;
namespace PMM.Domain.Interfaces.Repositories
{
    public interface IActivityRepository : _IBaseRepository<Activity>
    {
        Task<bool> HasConflictingActivityAsync(int userId, DateTime startTime, DateTime endTime, int? excludeActivityId = null);
    }
}
