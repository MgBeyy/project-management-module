using PMM.Core.Common;

namespace PMM.Core.Forms
{
    public class QueryActivityForm : BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = false;

        public int? Id { get; set; }
        public int? TaskId { get; set; }
        public int? UserId { get; set; }
        public string? Description { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? StartTimeMin { get; set; }
        public DateTime? StartTimeMax { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? EndTimeMin { get; set; }
        public DateTime? EndTimeMax { get; set; }
        public decimal? TotalHours { get; set; }
        public decimal? TotalHoursMin { get; set; }
        public decimal? TotalHoursMax { get; set; }
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
