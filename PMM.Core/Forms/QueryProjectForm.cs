using PMM.Core.Common;
using PMM.Data.Enums;

namespace PMM.Core.Forms
{
    public class QueryProjectForm : BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = false;

        public int? Id { get; set; }
        public string? Code { get; set; }
        public string? Title { get; set; }
        public DateTime? PlannedStartDate { get; set; }
        public DateTime? PlannedStartDateMin { get; set; }
        public DateTime? PlannedStartDateMax { get; set; }
        public DateTime? PlannedDeadline { get; set; }
        public DateTime? PlannedDeadlineMin { get; set; }
        public DateTime? PlannedDeadlineMax { get; set; }
        public int? PlannedHours { get; set; }
        public int? PlannedHoursMin { get; set; }
        public int? PlannedHoursMax { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndAt { get; set; }
        public EProjectStatus? Status { get; set; }
        public EProjectPriority? Priority { get; set; }
        public int? ParentProjectId { get; set; }
        public int? ClientId { get; set; }
    }
}
