using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface IProjectAssignmentService
    {
        Task<ProjectAssignmentDto> AddProjectAssignmentAsync(CreateProjectAssignmentForm form);
        Task<ProjectAssignmentDto> GetProjectAssignmentAsync(int projectAssignmentId);
        Task<ProjectAssignmentDto> EditProjectAssignmentAsync(int projectAssignmentId, UpdateProjectAssignmentForm form);
        Task<List<ProjectAssignmentDto>> GetAllProjectAssignments();
        Task<List<ProjectDto>> GetProjectsByUserIdAsync(int userId);
    }
}
