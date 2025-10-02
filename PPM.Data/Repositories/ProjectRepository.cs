using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface IProjectRepository : _IBaseRepository<Project>
    {
    }
    public class ProjectRepository : _BaseRepository<Project>, IProjectRepository
    {
        public ProjectRepository(ApplicationDbContext context, ILogger logger) : base(context, logger)
        {
        }
    }
}
