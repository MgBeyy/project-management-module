using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Forms
{
    public class UpdateTaskAssignmentForm
    {
        // Şimdilik sadece User değişimi için örnek, gerekirse alan eklenir
        [Required]
        public int UserId { get; set; }
    }
}