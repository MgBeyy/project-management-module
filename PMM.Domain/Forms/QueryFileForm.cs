using PMM.Domain.Common;

namespace PMM.Domain.Forms
{
    public class QueryFileForm : _BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = false;

        public int? Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? ProjectId { get; set; }
        public int? CreatedById { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? CreatedAtMin { get; set; }
        public DateTime? CreatedAtMax { get; set; }
        public int? UpdatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? UpdatedAtMin { get; set; }
        public DateTime? UpdatedAtMax { get; set; }
    }
}
