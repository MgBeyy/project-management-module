using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface ITaskDependencyRepository : _IBaseRepository<TaskDependency>
    {
        Task<List<TaskDependency>> GetByBlockingTaskIdAsync(int blockingTaskId);
        Task<List<TaskDependency>> GetByBlockedTaskIdAsync(int blockedTaskId);
        Task<TaskDependency?> GetByTaskIdsAsync(int blockingTaskId, int blockedTaskId);
        Task<bool> HasCircularDependencyAsync(int taskId, int targetTaskId);
        Task DeleteByTaskIdsAsync(int blockingTaskId, int blockedTaskId);
        Task<TaskDependency?> GetByIdWithTasksAsync(int dependencyId);
    }
}