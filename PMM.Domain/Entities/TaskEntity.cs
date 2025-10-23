using PMM.Domain.Enums;

namespace PMM.Domain.Entities
{
    public class TaskEntity : _BaseEntity
    {
        public string Code { get; set; }
        public int ProjectId { get; set; }
        public virtual Project Project { get; set; }

        public int? ParentTaskId { get; set; }
        public virtual TaskEntity? ParentTask { get; set; }
        public virtual ICollection<TaskEntity>? SubTasks { get; set; }

        public string Title { get; set; }
        public string? Description { get; set; }
        public ETaskStatus Status { get; set; }

        public decimal? PlannedHours { get; set; }
        public decimal? ActualHours { get; set; }

        public virtual ICollection<TaskAssignment> TaskAssignments { get; set; }
        public virtual ICollection<Activity> Activities { get; set; }
        public virtual ICollection<TaskLabel> TaskLabels { get; set; }

        public virtual ICollection<TaskDependency> Blocks { get; set; }
        public virtual ICollection<TaskDependency> BlockedBy { get; set; }
        public bool IsLast { get; set; }
    }
}
