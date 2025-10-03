using PMM.Core.Common;

namespace PMM.Core.DTOs
{
    public class QueryUserForm : BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; } // Sıralama için alan eklendi
        public bool SortDesc { get; set; } = false; // Azalan mı artan mı
    }
}
