using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface ITaskRepository : _IBaseRepository<TaskEntity>
    {
        Task<TaskEntity?> GetByCodeAsync(string code);
        Task<TaskEntity?> GetWithLabelsAsync(int taskId);
        Task<List<TaskEntity>> GetSubTasksWithLabelsAsync(int parentTaskId);
        Task<TaskEntity?> GetWithDependenciesAsync(int taskId);
    }
}
