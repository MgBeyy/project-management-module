using PMM.Domain.Common;

namespace PMM.Domain.Forms
{
    public class QueryUserForm : _BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = false;
    }
}
