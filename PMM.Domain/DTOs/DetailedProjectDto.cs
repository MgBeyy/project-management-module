using PMM.Domain.Enums;

namespace PMM.Domain.DTOs
{
    public class DetailedProjectDto
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

        public List<ProjectDto>? ParentProjects { get; set; }
        public List<ProjectDto>? ChildProjects { get; set; }

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

        public int TotalTaskCount { get; set; }
        public int DoneTaskCount { get; set; }
        public int LateTaskCount { get; set; }
        public int TodoTaskCount { get; set; }
        public int InProgressTaskCount { get; set; }
        public int InactiveTaskCount { get; set; }
        public int WaitingForApprovalTaskCount { get; set; }

        public int? ChildProjectsActiveCount { get; set; }
        public int? ChildProjectsPlannedCount { get; set; }
        public int? ChildProjectsInactiveCount { get; set; }
        public int? ChildProjectsWaitingForApprovalCount { get; set; }
        public int? ChildProjectsCompletedCount { get; set; }

        public List<BurnUpDataPointDto>? BurnUpChart { get; set; }
    }
}
