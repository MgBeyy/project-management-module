using PMM.Domain.Common;

namespace PMM.Domain.Forms
{
    public class QueryClientForm : _BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = false;
        public int? Id { get; set; }
        public string? Name { get; set; }
    }
}
