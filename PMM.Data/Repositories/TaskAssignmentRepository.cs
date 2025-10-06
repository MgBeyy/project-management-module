using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface ITaskAssignmentRepository : _IBaseRepository<TaskAssignment> { }
    public class TaskAssignmentRepository : _BaseRepository<TaskAssignment>, ITaskAssignmentRepository
    {
        public TaskAssignmentRepository(ApplicationDbContext context, ILogger<TaskAssignmentRepository> logger) : base(context, logger) { }
    }
}