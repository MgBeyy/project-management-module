using PMM.Domain.Enums;

namespace PMM.Domain.Entities
{
    public class ProjectAssignment : _BaseEntity
    {
        public int ProjectId { get; set; }
        public Project Project { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public EProjectAssignmentRole Role { get; set; }

        public DateOnly? StartedAt { get; set; }
        public DateOnly? EndAt { get; set; }
        public decimal? ExpectedHours { get; set; }
        public decimal? SpentHours { get; set; }
    }
}
