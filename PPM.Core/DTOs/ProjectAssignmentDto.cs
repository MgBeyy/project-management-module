using PMM.Data.Enums;

namespace PMM.Core.DTOs
{
    public class ProjectAssignmentDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public EProjectAssignmentRole Role { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndAt { get; set; }
        public int? ExpectedHours { get; set; }
        public int? SpentHours { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
    }
}
