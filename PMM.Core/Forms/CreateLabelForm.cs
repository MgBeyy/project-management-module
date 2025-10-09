using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class CreateLabelForm
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}
