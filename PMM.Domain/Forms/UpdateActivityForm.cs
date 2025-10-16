using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Forms
{
    public class UpdateActivityForm
    {
        [Required]
        [StringLength(1000)]
        public string Description { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }
    }
}
