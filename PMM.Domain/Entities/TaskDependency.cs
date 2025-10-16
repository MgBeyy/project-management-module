namespace PMM.Domain.Entities
{
    public class TaskDependency : _BaseEntity
    {
        public int BlockingTaskId { get; set; }
        public virtual TaskEntity BlockingTask { get; set; }

        public int BlockedTaskId { get; set; }
        public virtual TaskEntity BlockedTask { get; set; }
    }
}