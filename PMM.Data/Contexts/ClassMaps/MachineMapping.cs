using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class MachineMapping : _BaseEntityTypeConfiguration<Machine>
    {
        public override void Configure(EntityTypeBuilder<Machine> builder)
        {
            base.Configure(builder);

            builder.ToTable("Machines");

            builder.Property(m => m.Name).IsRequired().HasMaxLength(256);
            builder.Property(m => m.Category).IsRequired().HasMaxLength(100);
            builder.Property(m => m.Brand).IsRequired().HasMaxLength(100);
            builder.Property(m => m.Model).IsRequired().HasMaxLength(100);
            builder.Property(m => m.HourlyCost).IsRequired(false).HasPrecision(18, 2);
            builder.Property(m => m.Currency).IsRequired().HasMaxLength(10);
            builder.Property(m => m.PurchasePrice).IsRequired(false).HasPrecision(18, 2);
            builder.Property(m => m.PurchaseDate).IsRequired(false);
            builder.Property(m => m.IsActive).IsRequired();
            builder.Property(m => m.Status).IsRequired().HasConversion<string>();
        }
    }
}