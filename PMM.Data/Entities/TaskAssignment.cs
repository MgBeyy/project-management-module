namespace PMM.Data.Entities
{
    public class TaskAssignment
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public virtual TaskEntity Task { get; set; }

        public int UserId { get; set; }
        public virtual User User { get; set; }

        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }
    }
}
