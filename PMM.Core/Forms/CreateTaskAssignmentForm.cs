using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class CreateTaskAssignmentForm
    {
        [Required]
        public int TaskId { get; set; }
        [Required]
        public int UserId { get; set; }
    }
}