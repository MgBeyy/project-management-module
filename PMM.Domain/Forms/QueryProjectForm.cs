using PMM.Domain.Common;
using PMM.Domain.Enums;

namespace PMM.Domain.Forms
{
    public class QueryProjectForm : _BasePaginationForm
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
        public decimal? ActualHours { get; set; }
        public decimal? ActualHoursMin { get; set; }
        public decimal? ActualHoursMax { get; set; }
        public DateOnly? StartedAt { get; set; }
        public DateOnly? EndAt { get; set; }
        public EProjectStatus? Status { get; set; }
        public EProjectPriority? Priority { get; set; }
        public int? ParentProjectId { get; set; }
        public int? ClientId { get; set; }
    }
}
