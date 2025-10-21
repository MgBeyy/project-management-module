using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class TaskAssignmentRepository : _BaseRepository<TaskAssignment>, ITaskAssignmentRepository
    {
        public TaskAssignmentRepository(ApplicationDbContext context, ILogger<TaskAssignmentRepository> logger) : base(context, logger) { }

        public async Task<bool> IsUserAssignedToTaskAsync(int userId, int taskId)
        {
            return await _context.Set<TaskAssignment>()
                .AnyAsync(ta => ta.UserId == userId && ta.TaskId == taskId);
        }

        public async Task<TaskAssignment?> GetByUserIdAndTaskIdAsync(int userId, int taskId)
        {
            return await _context.Set<TaskAssignment>()
                .FirstOrDefaultAsync(ta => ta.UserId == userId && ta.TaskId == taskId);
        }
    }
}