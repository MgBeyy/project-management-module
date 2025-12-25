using PMM.Domain.Common;
using PMM.Domain.Enums;

namespace PMM.Domain.Forms
{
    public class QueryMachineForm : _BasePaginationForm
    {
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = false;

        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? Category { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public decimal? HourlyCost { get; set; }
        public decimal? HourlyCostMin { get; set; }
        public decimal? HourlyCostMax { get; set; }
        public string? Currency { get; set; }
        public decimal? PurchasePrice { get; set; }
        public decimal? PurchasePriceMin { get; set; }
        public decimal? PurchasePriceMax { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public DateTime? PurchaseDateMin { get; set; }
        public DateTime? PurchaseDateMax { get; set; }
        public bool? IsActive { get; set; }
        public EMachineStatus? Status { get; set; }
    }
}