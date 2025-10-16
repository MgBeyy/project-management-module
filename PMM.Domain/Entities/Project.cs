using PMM.Domain.Enums;

namespace PMM.Domain.Entities
{
    public class Project : _BaseEntity
    {
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

        public virtual ICollection<ProjectRelation>? ParentRelations { get; set; }
        public virtual ICollection<ProjectRelation>? ChildRelations { get; set; }

        public int? ClientId { get; set; }
        public virtual Client? Client { get; set; }

        public virtual ICollection<ProjectAssignment> Assignments { get; set; }
        public virtual ICollection<TaskEntity> Tasks { get; set; }
        public virtual ICollection<FileEntity> Files { get; set; }
        public virtual ICollection<ProjectLabel> ProjectLabels { get; set; }
    }
}
