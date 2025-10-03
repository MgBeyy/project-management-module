using PMM.Data.Enums;

namespace PMM.Core.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int? ParentTaskId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public ETaskStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public int Weight { get; set; }
        // public List<TaskAssignmentDto> TaskAssignments { get; set; } // Ýleride eklenebilir
    }
}
