using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class UserMapping : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id).ValueGeneratedOnAdd();
            builder.Property(u => u.Name).IsRequired().HasMaxLength(256);
            builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
            builder.HasIndex(u => u.Email).IsUnique();
            builder.Property(u => u.IsActive).IsRequired().HasDefaultValue(true);
            builder.Property(u => u.HourlyRate).IsRequired(false).HasPrecision(18, 2);
            builder.Property(u => u.Currency).IsRequired().HasMaxLength(10);

            builder.Property(e => e.IsDeleted).IsRequired().HasDefaultValue(false);
            builder.HasOne(e => e.DeletedByUser).WithMany().HasForeignKey(e => e.DeletedById).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}

