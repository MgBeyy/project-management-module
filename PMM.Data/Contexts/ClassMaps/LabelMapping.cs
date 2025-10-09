using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class LabelMapping : IEntityTypeConfiguration<Label>
    {
        public void Configure(EntityTypeBuilder<Label> builder)
        {
            builder.ToTable("Labels");
            builder.HasKey(l => l.Id);
            builder.Property(l => l.Id).ValueGeneratedOnAdd();

            builder.Property(l => l.Name).IsRequired().HasMaxLength(100);
            builder.Property(l => l.Color).IsRequired(false).HasMaxLength(50);
            builder.Property(l => l.Description).IsRequired(false).HasMaxLength(500);

            builder.Property(l => l.CreatedAt).IsRequired();
            builder.Property(l => l.CreatedById).IsRequired();
            builder.HasOne(l => l.CreatedByUser)
                   .WithMany()
                   .HasForeignKey(l => l.CreatedById)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(l => l.UpdatedAt).IsRequired(false);
            builder.Property(l => l.UpdatedById).IsRequired(false);
            builder.HasOne(l => l.UpdatedByUser)
                   .WithMany()
                   .HasForeignKey(l => l.UpdatedById)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
