using PMM.Data.Enums;
using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
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
        [Range(0, double.MaxValue, ErrorMessage = "Planlanan toplam saat negatif bir deðer alamaz!")]
        public decimal? PlannedHours { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Gerçekleþen toplam saat negatif bir deðer alamaz!")]
        public decimal? ActualHours { get; set; }
        public List<int>? LabelIds { get; set; }
    }
}
