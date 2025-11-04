using PMM.Domain.Enums;

namespace PMM.Domain.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public int ProjectId { get; set; }
        public string ProjectCode { get; set; }
        public int? ParentTaskId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public ETaskStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }

        public DateOnly? PlannedStartDate { get; set; }
        public DateOnly? PlannedEndDate { get; set; }
        public DateOnly? ActualStartDate { get; set; }
        public DateOnly? ActualEndDate { get; set; }

        public decimal? PlannedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public bool IsLast { get; set; }
        public List<LabelDto>? Labels { get; set; }
        public List<IdNameDto>? AssignedUsers { get; set; }
        public List<TaskDto>? SubTasks { get; set; }
    }
}
