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
    }
}
