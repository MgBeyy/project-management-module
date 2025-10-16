using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface ITaskAssignmentService
    {
        Task<TaskAssignmentDto> AddTaskAssignmentAsync(CreateTaskAssignmentForm form);
        Task<TaskAssignmentDto> GetTaskAssignmentAsync(int taskAssignmentId);
        Task<List<TaskAssignmentDto>> GetAllTaskAssignments();
        Task DeleteTaskAssignmentAsync(int taskAssignmentId);
    }
}