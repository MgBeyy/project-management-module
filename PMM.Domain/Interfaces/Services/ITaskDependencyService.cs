using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface ITaskDependencyService
    {
        Task<TaskDependencyDto> CreateDependencyAsync(CreateTaskDependencyForm form);
        Task<TaskDependenciesDto> GetTaskDependenciesAsync(int taskId);
        Task<TaskDependenciesDto> ManageTaskDependenciesAsync(ManageTaskDependenciesForm form);
        Task RemoveDependencyAsync(int blockingTaskId, int blockedTaskId);
        Task RemoveDependencyByIdAsync(int dependencyId);
    }
}