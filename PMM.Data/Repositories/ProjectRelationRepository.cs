using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface IProjectRelationRepository : _IBaseRepository<ProjectRelation>
    {
        Task<List<ProjectRelation>> GetByChildProjectIdAsync(int childProjectId);
        Task<List<ProjectRelation>> GetByParentProjectIdAsync(int parentProjectId);
        Task<ProjectRelation?> GetRelationAsync(int parentProjectId, int childProjectId);
        Task DeleteRelationAsync(int parentProjectId, int childProjectId);
    }
    
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
