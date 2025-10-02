using PMM.Data.Enums;
using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class CreateProjectAssignmentForm
    {
        [Required]
        public int ProjectId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        public EProjectAssignmentRole Role { get; set; } = EProjectAssignmentRole.Member;
        public DateTime? StartedAt { get; set; }
        public DateTime? EndAt { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Çalışılması beklenen toplam saat negatif bir değer alamaz!")]
        public int? ExpectedHours { get; set; }
    }
}
