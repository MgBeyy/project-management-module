namespace PMM.Domain.DTOs
{
    public class ActivityDto
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public int? UserId { get; set; }
        public int? MachineId { get; set; }
        public string Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TotalHours { get; set; }
        public bool IsLast { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
    }
}
