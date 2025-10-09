using PMM.Data.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PMM.Core.Forms
{
    public class CreateProjectForm
    {
        [Required]
        public string Code { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public DateOnly? PlannedStartDate { get; set; }
        public DateOnly? PlannedDeadline { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Planlanan toplam saat negatif bir değer alamaz!")]
        public int? PlannedHours { get; set; }
        public DateOnly? StartedAt { get; set; }
        public DateOnly? EndAt { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EProjectStatus? Status { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EProjectPriority Priority { get; set; } = EProjectPriority.Regular;

        public List<int>? ParentProjectIds { get; set; }

        public int? ClientId { get; set; }

        public List<int>? LabelIds { get; set; }
    }
}
