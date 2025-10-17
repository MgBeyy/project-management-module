using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public abstract class _BaseEntityTypeConfiguration<TEntity> : IEntityTypeConfiguration<TEntity> where TEntity : _BaseEntity
    {
        public virtual void Configure(EntityTypeBuilder<TEntity> builder)
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.Property(e => e.CreatedAt).IsRequired();
            builder.Property(e => e.CreatedById).IsRequired();
            builder.HasOne(e => e.CreatedByUser).WithMany().HasForeignKey(e => e.CreatedById).OnDelete(DeleteBehavior.Restrict);

            builder.Property(e => e.UpdatedAt).IsRequired(false);
            builder.Property(e => e.UpdatedById).IsRequired(false);
            builder.HasOne(e => e.UpdatedByUser).WithMany().HasForeignKey(e => e.UpdatedById).OnDelete(DeleteBehavior.Restrict);

            builder.Property(e => e.IsDeleted).IsRequired().HasDefaultValue(false);
            builder.HasOne(e => e.DeletedByUser).WithMany().HasForeignKey(e => e.DeletedById).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}