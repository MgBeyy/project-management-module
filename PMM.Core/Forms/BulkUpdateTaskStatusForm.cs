using System.ComponentModel.DataAnnotations;
using PMM.Data.Enums;

namespace PMM.Core.Forms
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