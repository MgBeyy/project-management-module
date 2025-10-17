using PMM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Forms
{
    public class BulkUpdateTaskStatusForm
    {
        [Required]
        public List<int> TaskIds { get; set; } = new();

        [Required]
        public ETaskStatus Status { get; set; }

        public bool IgnoreDependencyRules { get; set; } = false;
    }
}