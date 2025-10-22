using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class ProjectAssignmentRepository : _BaseRepository<ProjectAssignment>, IProjectAssignmentRepository
    {
        public ProjectAssignmentRepository(ApplicationDbContext context, ILogger<ProjectAssignmentRepository> logger) : base(context, logger)
        {
        }

        public async Task<List<ProjectAssignment>> GetByProjectIdAsync(int projectId)
        {
            return await _context.Set<ProjectAssignment>()
                .Where(pa => pa.ProjectId == projectId)
                .ToListAsync();
        }

        public async Task<ProjectAssignment?> GetByUserIdAndProjectIdAsync(int userId, int projectId)
        {
            return await _context.Set<ProjectAssignment>()
                .Where(pa => pa.UserId == userId && pa.ProjectId == projectId)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsUserAssignedToProjectAsync(int userId, int projectId)
        {
            return await _context.Set<ProjectAssignment>()
                .AnyAsync(pa => pa.UserId == userId && pa.ProjectId == projectId);
        }
    }
}
