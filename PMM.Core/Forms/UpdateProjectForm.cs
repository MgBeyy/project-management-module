using PMM.Data.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PMM.Core.Forms
{
    public class UpdateProjectForm
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public DateTime? PlannedStartDate { get; set; }
        public DateTime? PlannedDeadline { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Planlanan toplam saat negatif bir değer alamaz!")]
        public int? PlannedHours { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndAt { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EProjectStatus? Status { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EProjectPriority Priority { get; set; } = EProjectPriority.Regular;
        public int? ParentProjectId { get; set; }
    }
}
