using PMM.Data.Enums;

namespace PMM.Core.DTOs
{
    public class DetailedProjectDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public DateOnly? PlannedStartDate { get; set; }
        public DateOnly? PlannedDeadline { get; set; }
        public int? PlannedHours { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndAt { get; set; }
        public EProjectStatus Status { get; set; }
        public EProjectPriority Priority { get; set; }

        public List<ProjectDto>? ParentProjects { get; set; }

        public int? ClientId { get; set; }
        public ClientDto? Client { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedById { get; set; }
        public IdNameDto? CreatedByUser { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public IdNameDto? UpdatedByUser { get; set; }
    }
}
