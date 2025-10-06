using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface IProjectAssignmentRepository : _IBaseRepository<ProjectAssignment>
    {
    }
    public class ProjectAssignmentRepository : _BaseRepository<ProjectAssignment>, IProjectAssignmentRepository
    {
        public ProjectAssignmentRepository(ApplicationDbContext context, ILogger<ProjectAssignmentRepository> logger) : base(context, logger)
        {
        }
    }
}
