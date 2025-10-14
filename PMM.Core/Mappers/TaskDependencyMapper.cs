using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Data.Entities;

namespace PMM.Core.Mappers
{
    public class TaskDependencyMapper
    {
        public static TaskDependency Map(CreateTaskDependencyForm form)
        {
            return new TaskDependency
            {
                BlockingTaskId = form.BlockingTaskId,
                BlockedTaskId = form.BlockedTaskId
            };
        }

        public static TaskDependencyDto Map(TaskDependency dependency)
        {
            return new TaskDependencyDto
            {
                Id = dependency.Id,
                BlockingTaskId = dependency.BlockingTaskId,
                BlockingTaskTitle = dependency.BlockingTask?.Title ?? string.Empty,
                BlockedTaskId = dependency.BlockedTaskId,
                BlockedTaskTitle = dependency.BlockedTask?.Title ?? string.Empty,
                CreatedAt = dependency.CreatedAt,
                CreatedById = dependency.CreatedById,
                UpdatedAt = dependency.UpdatedAt,
                UpdatedById = dependency.UpdatedById
            };
        }

        public static List<TaskDependencyDto> Map(List<TaskDependency> dependencies)
        {
            return dependencies.Select(Map).ToList();
        }

        public static TaskDependenciesDto Map(TaskEntity task)
        {
            return new TaskDependenciesDto
            {
                TaskId = task.Id,
                TaskTitle = task.Title,
                Blocks = task.Blocks?.Select(td => TaskMapper.Map(td.BlockedTask)).ToList() ?? new List<TaskDto>(),
                BlockedBy = task.BlockedBy?.Select(td => TaskMapper.Map(td.BlockingTask)).ToList() ?? new List<TaskDto>()
            };
        }
    }
}