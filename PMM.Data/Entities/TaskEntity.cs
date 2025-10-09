using PMM.Data.Enums;

namespace PMM.Data.Entities
{
    public class TaskEntity
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public virtual Project Project { get; set; }

        public int? ParentTaskId { get; set; }
        public virtual TaskEntity? ParentTask { get; set; }
        public virtual ICollection<TaskEntity>? SubTasks { get; set; }

        public string Title { get; set; }
        public string? Description { get; set; }
        public int Weight { get; set; }
        public ETaskStatus Status { get; set; }

        public virtual ICollection<TaskAssignment> TaskAssignments { get; set; }
        public virtual ICollection<Activity> Activities { get; set; }
        public virtual ICollection<TaskLabel> TaskLabels { get; set; }

        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }

    }
}
