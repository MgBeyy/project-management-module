using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface IProjectService
    {
        Task<ProjectDto> AddProjectAsync(CreateProjectForm form);
        Task<ProjectDto> GetProjectAsync(int projectId);
        Task<ProjectDto> EditProjectAsync(int projectId, UpdateProjectForm form);
        Task<PagedResult<ProjectDto>> Query(QueryProjectForm form);
        Task<DetailedProjectDto> GetDetailedProjectAsync(int projectId);
        Task<DetailedProjectDto> GetDetailedProjectByCodeAsync(string code);
        Task<FullProjectHierarchyDto> GetFullProjectHierarchyAsync(int projectId);
        Task<List<FullProjectHierarchyDto>> QueryWithHierarchy(QueryProjectForm form);
        Task DeleteProjectAsync(int projectId);
    }
}
