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
        public DateTime? PlannedStartDate { get; set; }
        public DateTime? PlannedDeadline { get; set; }
        public int? PlannedHours { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndAt { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EProjectStatus? Status { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EProjectPriority Priority { get; set; } = EProjectPriority.Regular;
        public int? ParentProjectId { get; set; }
        public int? ClientId { get; set; }
    }
}
