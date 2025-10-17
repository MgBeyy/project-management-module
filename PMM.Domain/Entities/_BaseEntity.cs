using PMM.Domain.Interfaces;

namespace PMM.Domain.Entities
{
    public abstract class _BaseEntity : IAuditable, ISoftDeletable
    {
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public virtual User? CreatedByUser { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedById { get; set; }
        public virtual User? DeletedByUser { get; set; }
    }
}