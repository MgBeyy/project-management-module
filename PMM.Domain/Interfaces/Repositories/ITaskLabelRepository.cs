using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface ITaskLabelRepository : _IBaseRepository<TaskLabel>
    {
        Task<List<TaskLabel>> GetByTaskIdAsync(int taskId);
        Task<List<TaskLabel>> GetByLabelIdAsync(int labelId);
    }
}
