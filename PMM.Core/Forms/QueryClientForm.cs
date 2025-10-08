using PMM.Core.Common;

namespace PMM.Core.Forms
{
    public class QueryClientForm : BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = false;
        public int? Id { get; set; }
        public string? Name { get; set; }
    }
}
