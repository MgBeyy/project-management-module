using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class UpdateTaskAssignmentForm
    {
        // �imdilik sadece User de�i�imi i�in �rnek, gerekirse alan eklenir
        [Required]
        public int UserId { get; set; }
    }
}