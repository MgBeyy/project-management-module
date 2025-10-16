using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface IProjectLabelRepository : _IBaseRepository<ProjectLabel>
    {
        Task<List<ProjectLabel>> GetByProjectIdAsync(int projectId);
        Task<List<ProjectLabel>> GetByLabelIdAsync(int labelId);
    }
}
