using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class UpdateTaskAssignmentForm
    {
        // Þimdilik sadece User deðiþimi için örnek, gerekirse alan eklenir
        [Required]
        public int UserId { get; set; }
    }
}