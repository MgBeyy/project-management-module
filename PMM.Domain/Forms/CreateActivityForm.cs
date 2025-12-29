using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Forms
{
    public class CreateActivityForm
    {
        [Required]
        public int TaskId { get; set; }

        public int? UserId { get; set; }

        public int? MachineId { get; set; }

        [Required]
        [StringLength(1000)]
        public string Description { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }
        public bool IsLast { get; set; }
    }
}
