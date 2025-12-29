using PMM.Domain.Enums;

namespace PMM.Domain.Entities
{
    public class Machine : _BaseEntity
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public decimal? HourlyCost { get; set; }
        public string Currency { get; set; }
        public decimal? PurchasePrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public bool IsActive { get; set; }
        public EMachineStatus Status { get; set; }

        public virtual ICollection<Activity> Activities { get; set; }
    }
}