using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ProjectLabelMapping : IEntityTypeConfiguration<ProjectLabel>
    {
        public void Configure(EntityTypeBuilder<ProjectLabel> builder)
        {
            builder.ToTable("ProjectLabels");
            builder.HasKey(pl => pl.Id);
            builder.Property(pl => pl.Id).ValueGeneratedOnAdd();

            builder.Property(pl => pl.ProjectId).IsRequired();
            builder.Property(pl => pl.LabelId).IsRequired();

            builder.HasOne(pl => pl.Project)
                   .WithMany(p => p.ProjectLabels)
                   .HasForeignKey(pl => pl.ProjectId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(pl => pl.Label)
                   .WithMany(l => l.ProjectLabels)
                   .HasForeignKey(pl => pl.LabelId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(pl => new { pl.ProjectId, pl.LabelId })
                   .IsUnique();

            builder.Property(pl => pl.CreatedAt).IsRequired();
            builder.Property(pl => pl.CreatedById).IsRequired();
            builder.HasOne(pl => pl.CreatedByUser)
                   .WithMany()
                   .HasForeignKey(pl => pl.CreatedById)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(pl => pl.UpdatedAt).IsRequired(false);
            builder.Property(pl => pl.UpdatedById).IsRequired(false);
            builder.HasOne(pl => pl.UpdatedByUser)
                   .WithMany()
                   .HasForeignKey(pl => pl.UpdatedById)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
