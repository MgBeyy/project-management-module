using PMM.Data.Enums;

namespace PMM.Core.DTOs
{
    public class ProjectDto
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

        public List<int>? ParentProjectIds { get; set; }

        public int? ClientId { get; set; }
        public List<LabelDto>? Labels { get; set; }
        public int? CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
