using PMM.Domain.Common;

namespace PMM.Core.Common
{
    public class PagedResult<T> : _BasePaginationForm
    {
        public int TotalRecords { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalRecords / (PageSize ?? 10));
        public List<T> Data { get; set; } = new();
    }
}
