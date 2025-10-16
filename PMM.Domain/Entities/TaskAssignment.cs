namespace PMM.Domain.Entities
{
    public class TaskAssignment : _BaseEntity
    {
        public int TaskId { get; set; }
        public virtual TaskEntity Task { get; set; }

        public int UserId { get; set; }
        public virtual User User { get; set; }
    }
}
