using PMM.Data.Enums;

namespace PMM.Data.Entities
{

    public class Project
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

        public virtual ICollection<ProjectRelation>? ParentRelations { get; set; }
        public virtual ICollection<ProjectRelation>? ChildRelations { get; set; }


        public int? ClientId { get; set; }
        public virtual Client? Client { get; set; }

        public virtual ICollection<ProjectAssignment> Assignments { get; set; }
        public virtual ICollection<TaskEntity> Tasks { get; set; }
        public virtual ICollection<FileEntity> Files { get; set; }

        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
