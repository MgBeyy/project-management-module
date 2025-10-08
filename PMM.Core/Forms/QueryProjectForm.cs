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
        public DateOnly? PlannedStartDate { get; set; }
        public DateOnly? PlannedStartDateMin { get; set; }
        public DateOnly? PlannedStartDateMax { get; set; }
        public DateOnly? PlannedDeadline { get; set; }
        public DateOnly? PlannedDeadlineMin { get; set; }
        public DateOnly? PlannedDeadlineMax { get; set; }
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
