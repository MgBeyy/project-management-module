using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
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

    public class TaskDependencyRepository : _BaseRepository<TaskDependency>, ITaskDependencyRepository
    {
        public TaskDependencyRepository(ApplicationDbContext context, ILogger<TaskDependencyRepository> logger) 
            : base(context, logger)
        {
        }

        public async Task<List<TaskDependency>> GetByBlockingTaskIdAsync(int blockingTaskId)
        {
            return await Query(td => td.BlockingTaskId == blockingTaskId)
                .Include(td => td.BlockedTask)
                .ToListAsync();
        }

        public async Task<List<TaskDependency>> GetByBlockedTaskIdAsync(int blockedTaskId)
        {
            return await Query(td => td.BlockedTaskId == blockedTaskId)
                .Include(td => td.BlockingTask)
                .ToListAsync();
        }

        public async Task<TaskDependency?> GetByTaskIdsAsync(int blockingTaskId, int blockedTaskId)
        {
            return await Query(td => td.BlockingTaskId == blockingTaskId && td.BlockedTaskId == blockedTaskId)
                .FirstOrDefaultAsync();
        }

        public async Task<TaskDependency?> GetByIdWithTasksAsync(int dependencyId)
        {
            return await Query(td => td.Id == dependencyId)
                .Include(td => td.BlockingTask)
                .Include(td => td.BlockedTask)
                .FirstOrDefaultAsync();
        }

        public async Task DeleteByTaskIdsAsync(int blockingTaskId, int blockedTaskId)
        {
            var dependency = await GetByTaskIdsAsync(blockingTaskId, blockedTaskId);
            if (dependency != null)
            {
                Delete(dependency);
            }
        }

        public async Task<bool> HasCircularDependencyAsync(int taskId, int targetTaskId)
        {
            var visited = new HashSet<int>();
            return await CheckCircularDependencyRecursive(taskId, targetTaskId, visited);
        }

        private async Task<bool> CheckCircularDependencyRecursive(int currentTaskId, int targetTaskId, HashSet<int> visited)
        {
            if (currentTaskId == targetTaskId)
                return true;

            if (visited.Contains(currentTaskId))
                return false;

            visited.Add(currentTaskId);

            var blockedTasks = await Query(td => td.BlockingTaskId == currentTaskId)
                .Select(td => td.BlockedTaskId)
                .ToListAsync();

            foreach (var blockedTaskId in blockedTasks)
            {
                if (await CheckCircularDependencyRecursive(blockedTaskId, targetTaskId, visited))
                    return true;
            }

            return false;
        }
    }
}