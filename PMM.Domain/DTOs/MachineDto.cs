using PMM.Domain.Enums;

namespace PMM.Domain.DTOs
{
    public class MachineDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public decimal? HourlyCost { get; set; }
        public string Currency { get; set; }
        public decimal? PurchasePrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public int? UsefulLife { get; set; }
        public bool IsActive { get; set; }
        public EMachineStatus Status { get; set; }
        public int? CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}