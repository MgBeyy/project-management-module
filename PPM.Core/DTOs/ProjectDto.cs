using PMM.Data.Entities;
using PMM.Data.Enums;

namespace PMM.Core.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public DateTime? PlannedStartDate { get; set; }
        public DateTime? PlannedDeadline { get; set; }
        public int? PlannedHours { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndAt { get; set; }
        public EProjectStatus Status { get; set; }
        public EProjectPriority Priority { get; set; }

        public int? ParentProjectId { get; set; }
        public Project? ParentProject { get; set; }
        public ICollection<Project>? ChildProjects { get; set; }


        public int? ClientId { get; set; }
        public Client? Client { get; set; }

        public ICollection<ProjectAssignment> Assignments { get; set; }

        public int CreatedById { get; set; }
        public User CreatedByUser { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? UpdatedById { get; set; }
        public User? UpdatedByUser { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
