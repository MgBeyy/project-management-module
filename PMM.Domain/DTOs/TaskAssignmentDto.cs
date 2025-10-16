namespace PMM.Domain.DTOs
{
    public class TaskAssignmentDto
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
    }
}