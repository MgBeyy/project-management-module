using PMM.Domain.Attributes;
using PMM.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PMM.Domain.Forms
{
    public class CreateProjectForm
    {
        [Required]
        public string Code { get; set; }
        [Required]
        public string Title { get; set; }
        public DateOnly? PlannedStartDate { get; set; }
        public DateOnly? PlannedDeadline { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Planlanan toplam saat negatif bir değer alamaz!")]
        public int? PlannedHours { get; set; }
        public DateOnly? StartedAt { get; set; }
        public DateOnly? EndAt { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        [ValidNullableEnum(ErrorMessage = "Geçerli bir proje durumu seçiniz.")]
        public EProjectStatus? Status { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        [ValidEnum(ErrorMessage = "Geçerli bir proje önceliği seçiniz.")]
        public EProjectPriority Priority { get; set; } = EProjectPriority.Regular;
        [JsonConverter(typeof(JsonStringEnumConverter))]
        [ValidNullableEnum(ErrorMessage = "Geçerli bir proje türü seçiniz.")]
        public EProjectType? Type { get; set; }

        public List<int>? ParentProjectIds { get; set; }

        public int? ClientId { get; set; }

        public List<int>? LabelIds { get; set; }

        public List<ProjectAssignmentItemForm>? AssignedUsers { get; set; }
    }
}
