using PMM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Forms
{
    public class ProjectAssignmentItemForm
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public EProjectAssignmentRole Role { get; set; } = EProjectAssignmentRole.Member;
        
        public DateOnly? StartedAt { get; set; }
        
        public DateOnly? EndAt { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "�al���lmas� beklenen toplam saat negatif bir de�er alamaz!")]
        public int? ExpectedHours { get; set; }
    }
}