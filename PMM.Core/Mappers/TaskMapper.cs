using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Core.Mappers
{
    public class TaskMapper
    {
        public static TaskEntity Map(CreateTaskForm form)
        {
            return new TaskEntity
            {
                Code = form.Code,
                ProjectId = form.ProjectId.Value,
                ParentTaskId = form.ParentTaskId,
                Description = form.Description,
                Title = form.Title,
                Status = form.Status,
                PlannedHours = form.PlannedHours,
                ActualHours = form.ActualHours
            };
        }

        public static TaskDto Map(TaskEntity task)
        {
            return new TaskDto
            {
                Id = task.Id,
                Code = task.Code,
                ProjectId = task.ProjectId,
                ProjectCode = task.Project?.Code,
                ParentTaskId = task.ParentTaskId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                PlannedHours = task.PlannedHours,
                ActualHours = task.ActualHours,
                Labels = task.TaskLabels?
                    .Select(tl => LabelMapper.Map(tl.Label))
                    .ToList(),
                CreatedAt = task.CreatedAt,
                CreatedById = task.CreatedById,
                UpdatedAt = task.UpdatedAt,
                UpdatedById = task.UpdatedById
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
            task.Status = form.Status;
            task.PlannedHours = form.PlannedHours;
            task.ActualHours = form.ActualHours;
            return task;
        }
    }
}
