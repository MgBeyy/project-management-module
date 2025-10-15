using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class LabelMapping : _BaseEntityTypeConfiguration<Label>
    {
        public override void Configure(EntityTypeBuilder<Label> builder)
        {
            base.Configure(builder);

            builder.ToTable("Labels");

            builder.Property(l => l.Name).IsRequired().HasMaxLength(100);
            builder.Property(l => l.Color).IsRequired(false).HasMaxLength(50);
            builder.Property(l => l.Description).IsRequired(false).HasMaxLength(500);
        }
    }
}
