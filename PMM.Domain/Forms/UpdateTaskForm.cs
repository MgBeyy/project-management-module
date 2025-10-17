using PMM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Forms
{
    public class UpdateTaskForm
    {
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        [Required]
        public int Weight { get; set; }
        [Required]
        public ETaskStatus Status { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Planlanan toplam saat negatif bir de�er alamaz!")]
        public decimal? PlannedHours { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Gerçekleşen toplam saat negatif bir değer alamaz!")]
        public decimal? ActualHours { get; set; }
        public List<int>? LabelIds { get; set; }
    }
}
