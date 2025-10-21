using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface ITaskAssignmentRepository : _IBaseRepository<TaskAssignment> 
    {
        Task<bool> IsUserAssignedToTaskAsync(int userId, int taskId);
        Task<TaskAssignment?> GetByUserIdAndTaskIdAsync(int userId, int taskId);
        Task<List<TaskAssignment>> GetByTaskIdAsync(int taskId);
    }
}