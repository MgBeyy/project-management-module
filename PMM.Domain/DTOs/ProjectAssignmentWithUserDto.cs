using PMM.Domain.Enums;

namespace PMM.Domain.DTOs
{
    public class ProjectAssignmentWithUserDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public IdNameDto User { get; set; }
        public EProjectAssignmentRole Role { get; set; }
        public DateOnly? StartedAt { get; set; }
        public DateOnly? EndAt { get; set; }
        public int? ExpectedHours { get; set; }
        public int? SpentHours { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
    }
}