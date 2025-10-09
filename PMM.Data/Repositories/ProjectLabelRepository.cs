using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface IProjectLabelRepository : _IBaseRepository<ProjectLabel>
    {
        Task<List<ProjectLabel>> GetByProjectIdAsync(int projectId);
        Task<List<ProjectLabel>> GetByLabelIdAsync(int labelId);
    }

    public class ProjectLabelRepository : _BaseRepository<ProjectLabel>, IProjectLabelRepository
    {
        public ProjectLabelRepository(ApplicationDbContext context, ILogger<ProjectLabelRepository> logger)
             : base(context, logger)
        {
        }

        public async Task<List<ProjectLabel>> GetByProjectIdAsync(int projectId)
        {
            return await Task.FromResult(Query(pl => pl.ProjectId == projectId).ToList());
        }

        public async Task<List<ProjectLabel>> GetByLabelIdAsync(int labelId)
        {
            return await Task.FromResult(Query(pl => pl.LabelId == labelId).ToList());
        }
    }
}
