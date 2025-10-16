using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Forms
{
    public class CreateTaskAssignmentForm
    {
        [Required]
        public int TaskId { get; set; }
        [Required]
        public int UserId { get; set; }
    }
}