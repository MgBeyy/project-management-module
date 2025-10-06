using PMM.Core.Common;

namespace PMM.Core.Forms
{
    public class QueryUserForm : BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = false;
    }
}
