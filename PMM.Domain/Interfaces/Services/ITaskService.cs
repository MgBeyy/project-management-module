using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface ITaskService
    {
        Task<TaskDto> AddTaskAsync(CreateTaskForm form);
        Task<TaskDto> GetTaskAsync(int taskId);
        Task<TaskDto> EditTaskAsync(int taskId, UpdateTaskForm form);
        Task<PagedResult<TaskDto>> Query(QueryTaskForm form);
        Task<List<TaskDto>> GetSubTasksByTaskId(int taskId);
        Task DeleteTaskAsync(int taskId);
        Task<List<TaskDto>> BulkUpdateTaskStatusAsync(BulkUpdateTaskStatusForm form);
    }
}
