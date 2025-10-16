using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Core.Mappers
{
    public class TaskAssignmentMapper
    {
        public static TaskAssignment Map(CreateTaskAssignmentForm form)
        {
            return new TaskAssignment
            {
                TaskId = form.TaskId,
                UserId = form.UserId
            };
        }
        public static TaskAssignmentDto Map(TaskAssignment ta)
        {
            return new TaskAssignmentDto
            {
                Id = ta.Id,
                TaskId = ta.TaskId,
                UserId = ta.UserId,
                CreatedAt = ta.CreatedAt,
                CreatedById = ta.CreatedById,
                UpdatedAt = ta.UpdatedAt,
                UpdatedById = ta.UpdatedById
            };
        }
        public static List<TaskAssignmentDto> Map(List<TaskAssignment> tas)
        {
            return tas.Select(Map).ToList();
        }
        public static TaskAssignment Map(UpdateTaskAssignmentForm form, TaskAssignment ta)
        {
            ta.UserId = form.UserId;
            return ta;
        }
    }
}