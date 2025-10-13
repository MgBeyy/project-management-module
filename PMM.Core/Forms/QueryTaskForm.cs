using PMM.Data.Enums;
using PMM.Core.Common;

namespace PMM.Core.Forms
{
    public class QueryTaskForm : BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = false;

        public int? Id { get; set; }
        public int? ProjectId { get; set; }
        public int? ParentTaskId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? Weight { get; set; }
        public int? WeightMin { get; set; }
        public int? WeightMax { get; set; }
        public ETaskStatus? Status { get; set; }
        public decimal? PlannedHours { get; set; }
        public decimal? PlannedHoursMin { get; set; }
        public decimal? PlannedHoursMax { get; set; }
        public decimal? ActualHours { get; set; }
        public decimal? ActualHoursMin { get; set; }
        public decimal? ActualHoursMax { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? CreatedAtMin { get; set; }
        public DateTime? CreatedAtMax { get; set; }
        public int? CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? UpdatedAtMin { get; set; }
        public DateTime? UpdatedAtMax { get; set; }
        public int? UpdatedById { get; set; }
    }
}