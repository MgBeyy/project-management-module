namespace PMM.Domain.Entities
{
    public class Activity : _BaseEntity
    {
        public int TaskId { get; set; }
        public virtual TaskEntity Task { get; set; }

        public int? UserId { get; set; }
        public virtual User User { get; set; }

        public int? MachineId { get; set; }
        public virtual Machine Machine { get; set; }

        public string Description { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public decimal TotalHours { get; set; }
        public bool IsLast { get; set; }
    }
}
