using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class ProjectRelationRepository : _BaseRepository<ProjectRelation>, IProjectRelationRepository
    {
        public ProjectRelationRepository(ApplicationDbContext context, ILogger<ProjectRelationRepository> logger)
            : base(context, logger)
        {
        }

        public async Task<List<ProjectRelation>> GetByChildProjectIdAsync(int childProjectId)
        {
            return await _dbSet
                .Include(pr => pr.ParentProject)
                .Where(pr => pr.ChildProjectId == childProjectId)
                .ToListAsync();
        }

        public async Task<List<ProjectRelation>> GetByParentProjectIdAsync(int parentProjectId)
        {
            return await _dbSet
                .Include(pr => pr.ChildProject)
                .Where(pr => pr.ParentProjectId == parentProjectId)
                .ToListAsync();
        }

        public async Task<ProjectRelation?> GetRelationAsync(int parentProjectId, int childProjectId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(pr => pr.ParentProjectId == parentProjectId && pr.ChildProjectId == childProjectId);
        }

        public async Task DeleteRelationAsync(int parentProjectId, int childProjectId)
        {
            var relation = await GetRelationAsync(parentProjectId, childProjectId);
            if (relation != null)
            {
                _dbSet.Remove(relation);
            }
        }

        public async Task<HashSet<int>> GetAllRelatedProjectIdsAsync(int projectId)
        {
            var allRelations = await _dbSet.ToListAsync();
            var parents = new Dictionary<int, List<int>>();
            var children = new Dictionary<int, List<int>>();

            foreach (var rel in allRelations)
            {
                if (!parents.ContainsKey(rel.ChildProjectId))
                    parents[rel.ChildProjectId] = new List<int>();
                parents[rel.ChildProjectId].Add(rel.ParentProjectId);

                if (!children.ContainsKey(rel.ParentProjectId))
                    children[rel.ParentProjectId] = new List<int>();
                children[rel.ParentProjectId].Add(rel.ChildProjectId);
            }

            var visited = new HashSet<int>();
            var queue = new Queue<int>();
            queue.Enqueue(projectId);
            visited.Add(projectId);

            while (queue.Count > 0)
            {
                var current = queue.Dequeue();

                // Add parents
                if (parents.ContainsKey(current))
                {
                    foreach (var parent in parents[current])
                    {
                        if (!visited.Contains(parent))
                        {
                            visited.Add(parent);
                            queue.Enqueue(parent);
                        }
                    }
                }

                // Add children
                if (children.ContainsKey(current))
                {
                    foreach (var child in children[current])
                    {
                        if (!visited.Contains(child))
                        {
                            visited.Add(child);
                            queue.Enqueue(child);
                        }
                    }
                }
            }

            return visited;
        }

        public async Task<bool> HasCircularDependencyAsync(int childProjectId, int parentProjectId)
        {
            var visited = new HashSet<int>();
            return await CheckCircularDependencyRecursive(childProjectId, parentProjectId, visited);
        }

        private async Task<bool> CheckCircularDependencyRecursive(int currentProjectId, int targetProjectId, HashSet<int> visited)
        {
            if (currentProjectId == targetProjectId)
                return true;

            if (visited.Contains(currentProjectId))
                return false;

            visited.Add(currentProjectId);

            // Get all parents of currentProjectId
            var parentRelations = await _dbSet
                .Where(pr => pr.ChildProjectId == currentProjectId)
                .Select(pr => pr.ParentProjectId)
                .ToListAsync();

            foreach (var parentId in parentRelations)
            {
                if (await CheckCircularDependencyRecursive(parentId, targetProjectId, visited))
                    return true;
            }

            return false;
        }
    }
}
