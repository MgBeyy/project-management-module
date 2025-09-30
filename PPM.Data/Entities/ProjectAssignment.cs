using PMM.Data.Enums;

namespace PMM.Data.Entities
{
    public class ProjectAssignment
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public EProjectAssignmentRole Role { get; set; }

        public DateTime? StartedAt { get; set; }
        public DateTime? EndAt { get; set; }
        public int? ExpectedHours { get; set; }
        public int? SpentHours { get; set; }

        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
