namespace PMM.Data.Entities
{
    public class TaskDependency
    {
        public int Id { get; set; }
        
        public int BlockingTaskId { get; set; }
        public virtual TaskEntity BlockingTask { get; set; }

        public int BlockedTaskId { get; set; }
        public virtual TaskEntity BlockedTask { get; set; }

        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }
    }
}