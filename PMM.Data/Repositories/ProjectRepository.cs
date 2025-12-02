using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class ProjectRepository : _BaseRepository<Project>, IProjectRepository
    {
        public ProjectRepository(ApplicationDbContext context, ILogger<ProjectRepository> logger) : base(context, logger)
        {
        }

        public async Task<Project?> GetByCodeAsync(string code)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.Code.ToLower() == code.ToLower());
        }

        public async Task<Project?> GetWithDetailsAsync(int projectId)
        {
            return await Query(p => p.Id == projectId)
                .Include(p => p.ParentRelations)
                    .ThenInclude(pr => pr.ParentProject)
                .Include(p => p.ProjectLabels)
                    .ThenInclude(pl => pl.Label)
                .Include(p => p.Assignments)
                    .ThenInclude(a => a.User)
                .Include(p => p.Client)
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .FirstOrDefaultAsync();
        }
    }
}
