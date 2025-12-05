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
            var project = await Query(p => p.Id == projectId)
                .Include(p => p.ParentRelations)
                    .ThenInclude(pr => pr.ParentProject)
                .Include(p => p.ProjectLabels)
                    .ThenInclude(pl => pl.Label)
                .Include(p => p.Assignments)
                .Include(p => p.Client)
                .FirstOrDefaultAsync();

            if (project == null) return null;

            // Fetch users and clients ignoring soft delete filter
            if (project.CreatedById > 0)
                project.CreatedByUser = await _context.Set<User>().IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == project.CreatedById);

            if (project.UpdatedById.HasValue)
                project.UpdatedByUser = await _context.Set<User>().IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == project.UpdatedById.Value);

            if (project.Assignments != null)
                foreach (var assignment in project.Assignments)
                    assignment.User = await _context.Set<User>().IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == assignment.UserId);

            if (project.ClientId.HasValue)
                project.Client = await _context.Set<Client>().IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == project.ClientId.Value);

            return project;
        }
    }
}
