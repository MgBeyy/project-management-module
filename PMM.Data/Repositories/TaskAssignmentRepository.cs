using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class TaskAssignmentRepository : _BaseRepository<TaskAssignment>, ITaskAssignmentRepository
    {
        public TaskAssignmentRepository(ApplicationDbContext context, ILogger<TaskAssignmentRepository> logger) : base(context, logger) { }
    }
}