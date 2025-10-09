using PMM.Data.Enums;
using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class UpdateTaskForm
    {
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        [Required]
        public int Weight { get; set; }
        [Required]
        public ETaskStatus Status { get; set; }
        public List<int>? LabelIds { get; set; }
    }
}
