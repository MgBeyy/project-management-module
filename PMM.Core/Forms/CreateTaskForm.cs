using PMM.Data.Enums;
using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class CreateTaskForm
    {
        [Required]
        public int? ProjectId { get; set; }
        public int? ParentTaskId { get; set; }
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        [Required]
        [Range(1, 10)]
        public int? Weight { get; set; }
        public ETaskStatus Status { get; set; } = ETaskStatus.Todo;
        public List<int>? LabelIds { get; set; }
    }
}
