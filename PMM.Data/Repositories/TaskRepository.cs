using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface ITaskRepository : _IBaseRepository<TaskEntity>
    {
    }
    public class TaskRepository : _BaseRepository<TaskEntity>, ITaskRepository
    {
        public TaskRepository(ApplicationDbContext context, ILogger<TaskRepository> logger) : base(context, logger)
        {
        }
    }
}
