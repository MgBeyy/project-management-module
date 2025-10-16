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
    }
}
