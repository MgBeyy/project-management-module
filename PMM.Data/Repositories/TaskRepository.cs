using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class TaskRepository : _BaseRepository<TaskEntity>, ITaskRepository
    {
        public TaskRepository(ApplicationDbContext context, ILogger<TaskRepository> logger) : base(context, logger)
        {
        }

        public async Task<TaskEntity?> GetWithLabelsAsync(int taskId)
        {
            return await Query(t => t.Id == taskId)
                .Include(t => t.Project)
                .Include(t => t.TaskLabels)
                    .ThenInclude(tl => tl.Label)
                .Include(t => t.TaskAssignments)
                    .ThenInclude(ta => ta.User)
                .FirstOrDefaultAsync();
        }

        public async Task<List<TaskEntity>> GetSubTasksWithLabelsAsync(int parentTaskId)
        {
            return await Query(t => t.ParentTaskId == parentTaskId)
                .Include(t => t.TaskLabels)
                    .ThenInclude(tl => tl.Label)
                .Include(t => t.TaskAssignments)
                    .ThenInclude(ta => ta.User)
                .ToListAsync();
        }

        public async Task<TaskEntity?> GetWithDependenciesAsync(int taskId)
        {
            return await Query(t => t.Id == taskId)
                .Include(t => t.Blocks)
                    .ThenInclude(td => td.BlockedTask)
                .Include(t => t.BlockedBy)
                    .ThenInclude(td => td.BlockingTask)
                .FirstOrDefaultAsync();
        }

        public async Task<TaskEntity?> GetByCodeAsync(string code)
        {
            return await _dbSet.FirstOrDefaultAsync(t => t.Code == code);
        }

        public async Task<List<TaskEntity>> GetByProjectIdAsync(int projectId)
        {
            return await Query(t => t.ProjectId == projectId)
                .Include(t => t.Project)
                .Include(t => t.TaskLabels)
                    .ThenInclude(tl => tl.Label)
                .Include(t => t.TaskAssignments)
                    .ThenInclude(ta => ta.User)
                .ToListAsync();
        }

        public async Task<List<TaskEntity>> GetByUserIdAsync(int userId)
        {
            return await Query(t => t.TaskAssignments.Any(ta => ta.UserId == userId))
                .Include(t => t.Project)
                .Include(t => t.TaskLabels)
                    .ThenInclude(tl => tl.Label)
                .Include(t => t.TaskAssignments)
                    .ThenInclude(ta => ta.User)
                .ToListAsync();
        }

        public async Task<List<TaskEntity>> GetByIdsAsync(IEnumerable<int> ids)
        {
            return await Task.FromResult(_dbSet.Where(t => ids.Contains(t.Id)).ToList());
        }

        public async Task<List<TaskEntity>> GetByIdsWithLabelsAsync(IEnumerable<int> ids)
        {
            return await Task.FromResult(Query(t => ids.Contains(t.Id))
                .Include(t => t.Project)
                .Include(t => t.TaskLabels)
                    .ThenInclude(tl => tl.Label)
                .Include(t => t.TaskAssignments)
                    .ThenInclude(ta => ta.User)
                .ToList());
        }
    }
}
