using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Forms
{
    public class CreateUserForm
    {
        [Required]
        public string Name { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Saatlik ücret negatif bir değer alamaz.")]
        public decimal? HourlyRate { get; set; }
        public string Currency { get; set; } = "TL";
    }
}
