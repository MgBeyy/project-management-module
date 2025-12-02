using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface IProjectRepository : _IBaseRepository<Project>
    {
        Task<Project?> GetByCodeAsync(string code);
        Task<Project?> GetWithDetailsAsync(int projectId);
    }
}
