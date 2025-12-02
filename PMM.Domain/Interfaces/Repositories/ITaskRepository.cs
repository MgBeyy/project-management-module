using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface ITaskRepository : _IBaseRepository<TaskEntity>
    {
        Task<TaskEntity?> GetByCodeAsync(string code);
        Task<TaskEntity?> GetWithLabelsAsync(int taskId);
        Task<List<TaskEntity>> GetSubTasksWithLabelsAsync(int parentTaskId);
        Task<TaskEntity?> GetWithDependenciesAsync(int taskId);
        Task<List<TaskEntity>> GetByProjectIdAsync(int projectId);
        Task<List<TaskEntity>> GetByUserIdAsync(int userId);
        Task<List<TaskEntity>> GetByIdsAsync(IEnumerable<int> ids);
        Task<List<TaskEntity>> GetByIdsWithLabelsAsync(IEnumerable<int> ids);
    }
}
