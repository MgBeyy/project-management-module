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
    }
}
