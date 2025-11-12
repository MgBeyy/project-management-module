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
                PlannedStartDate = form.PlannedStartDate,
                PlannedEndDate = form.PlannedEndDate,
                ActualStartDate = form.ActualStartDate,
                ActualEndDate = form.ActualEndDate,
                PlannedHours = form.PlannedHours,
                ActualHours = form.ActualHours,
                IsLast = form.IsLast
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
                PlannedStartDate = task.PlannedStartDate,
                PlannedEndDate = task.PlannedEndDate,
                ActualStartDate = task.ActualStartDate,
                ActualEndDate = task.ActualEndDate,
                PlannedHours = task.PlannedHours,
                ActualHours = task.ActualHours,
                IsLast = task.IsLast,
                Labels = task.TaskLabels?
                    .Where(tl => tl.Label != null)
                    .Select(tl => LabelMapper.Map(tl.Label))
                    .ToList(),
                AssignedUsers = task.TaskAssignments?
                    .Select(ta => IdNameMapper.Map(ta.User.Id, ta.User.Name))
                    .ToList(),
                Project = task.Project != null ? IdNameMapper.Map(task.Project.Id, task.Project.Title) : null,
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
            task.PlannedStartDate = form.PlannedStartDate;
            task.PlannedEndDate = form.PlannedEndDate;
            task.ActualStartDate = form.ActualStartDate;
            task.ActualEndDate = form.ActualEndDate;
            task.PlannedHours = form.PlannedHours;
            task.ActualHours = form.ActualHours;
            task.IsLast = form.IsLast;
            return task;
        }
    }
}
