using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface IProjectAssignmentRepository : _IBaseRepository<ProjectAssignment>
    {
        Task<List<ProjectAssignment>> GetByProjectIdAsync(int projectId);
    }
}
