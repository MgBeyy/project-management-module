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
        [Required]
        public string Description { get; set; }
        [Required]
        public int? Weight { get; set; }
        [Required]
        public ETaskStatus Status { get; set; }
    }
}
