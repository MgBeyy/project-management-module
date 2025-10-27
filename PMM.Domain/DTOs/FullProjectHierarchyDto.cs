using PMM.Domain.Enums;

namespace PMM.Domain.DTOs
{
    public class FullProjectHierarchyDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public DateOnly? PlannedStartDate { get; set; }
        public DateOnly? PlannedDeadline { get; set; }
        public int? PlannedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public DateOnly? StartedAt { get; set; }
        public DateOnly? EndAt { get; set; }
        public EProjectStatus Status { get; set; }
        public EProjectPriority Priority { get; set; }

        public List<object>? ParentProjects { get; set; }
        public List<object>? ChildProjects { get; set; }

        public int? ClientId { get; set; }
        public ClientDto? Client { get; set; }

        public List<LabelDto>? Labels { get; set; }

        public List<ProjectAssignmentWithUserDto>? AssignedUsers { get; set; }

        public List<TaskDto>? Tasks { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedById { get; set; }
        public IdNameDto? CreatedByUser { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public IdNameDto? UpdatedByUser { get; set; }
    }
}