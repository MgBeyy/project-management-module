namespace PMM.Domain.DTOs
{
    public class TaskDependencyDto
    {
        public int Id { get; set; }
        public int BlockingTaskId { get; set; }
        public string BlockingTaskTitle { get; set; }
        public int BlockedTaskId { get; set; }
        public string BlockedTaskTitle { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
    }

    public class TaskDependenciesDto
    {
        public int TaskId { get; set; }
        public string TaskTitle { get; set; }
        public List<TaskDto> Blocks { get; set; } = new();
        public List<TaskDto> BlockedBy { get; set; } = new();
    }
}