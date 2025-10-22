using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface IProjectAssignmentRepository : _IBaseRepository<ProjectAssignment>
    {
        Task<List<ProjectAssignment>> GetByProjectIdAsync(int projectId);
        Task<ProjectAssignment?> GetByUserIdAndProjectIdAsync(int userId, int projectId);
        Task<bool> IsUserAssignedToProjectAsync(int userId, int projectId);
    }
}
