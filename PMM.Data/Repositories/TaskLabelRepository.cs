using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface ITaskLabelRepository : _IBaseRepository<TaskLabel>
    {
        Task<List<TaskLabel>> GetByTaskIdAsync(int taskId);
        Task<List<TaskLabel>> GetByLabelIdAsync(int labelId);
    }

    public class TaskLabelRepository : _BaseRepository<TaskLabel>, ITaskLabelRepository
    {
        public TaskLabelRepository(ApplicationDbContext context, ILogger<TaskLabelRepository> logger)
             : base(context, logger)
        {
        }

        public async Task<List<TaskLabel>> GetByTaskIdAsync(int taskId)
        {
            return await Task.FromResult(Query(tl => tl.TaskId == taskId).ToList());
        }

        public async Task<List<TaskLabel>> GetByLabelIdAsync(int labelId)
        {
            return await Task.FromResult(Query(tl => tl.LabelId == labelId).ToList());
        }
    }
}
