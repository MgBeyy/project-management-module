using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Data.Entities;

namespace PMM.Core.Mappers
{
    public class TaskMapper
    {
        public static TaskEntity Map(CreateTaskForm form)
        {
            return new TaskEntity
            {
                ProjectId = form.ProjectId.Value,
                ParentTaskId = form.ParentTaskId,
                Description = form.Description,
                Title = form.Title,
                Status = form.Status,
                Weight = form.Weight.Value
            };
        }

        public static TaskDto Map(TaskEntity task)
        {
            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                ParentTaskId = task.ParentTaskId,
                Title = task.Title,
                Description = task.Description,
                Weight = task.Weight,
                Status = task.Status,
                CreatedAt = task.CreatedAt,
                CreatedById = task.CreatedById,
                UpdatedAt = task.UpdatedAt,
                UpdatedById = task.UpdatedById,
            };
        }

        public static List<TaskDto> Map(List<TaskEntity> tasks)
        {
            return tasks.Select(Map).ToList();
        }

        public static TaskEntity Map(UpdateTaskForm form, TaskEntity task)
        {
            task.Title = form.Title;
            task.Description = form.Description;
            task.Weight = form.Weight;
            task.Status = form.Status;
            return task;
        }
    }
}
