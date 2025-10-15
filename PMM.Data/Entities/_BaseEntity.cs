using PMM.Data.Entities.Interfaces;

namespace PMM.Data.Entities
{
    public abstract class _BaseEntity : IAuditable, ISoftDeletable
    {
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public int? DeletedById { get; set; }
        public virtual User? DeletedByUser { get; set; }
    }
}