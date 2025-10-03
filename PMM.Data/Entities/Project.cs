using PMM.Data.Enums;

namespace PMM.Data.Entities
{

    public class Project
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
        public virtual Project? ParentProject { get; set; }
        public virtual ICollection<Project>? ChildProjects { get; set; }


        public int? ClientId { get; set; }
        public virtual Client? Client { get; set; }

        public virtual ICollection<ProjectAssignment> Assignments { get; set; }

        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
