using PMM.Data.Enums;
using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class UpdateProjectAssignmentForm
    {
        [Required]
        public EProjectAssignmentRole Role { get; set; } = EProjectAssignmentRole.Member;
        public DateOnly? StartedAt { get; set; }
        public DateOnly? EndAt { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Çalışılması beklenen toplam saat negatif bir değer alamaz!")]
        public int? ExpectedHours { get; set; }
    }
}
