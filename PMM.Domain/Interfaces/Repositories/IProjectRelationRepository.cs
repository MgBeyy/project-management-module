using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface IProjectRelationRepository : _IBaseRepository<ProjectRelation>
    {
        Task<List<ProjectRelation>> GetByChildProjectIdAsync(int childProjectId);
        Task<List<ProjectRelation>> GetByParentProjectIdAsync(int parentProjectId);
        Task<ProjectRelation?> GetRelationAsync(int parentProjectId, int childProjectId);
        Task DeleteRelationAsync(int parentProjectId, int childProjectId);
        Task<HashSet<int>> GetAllRelatedProjectIdsAsync(int projectId);
    }
}
