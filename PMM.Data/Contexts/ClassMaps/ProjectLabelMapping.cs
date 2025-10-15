using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ProjectLabelMapping : _BaseEntityTypeConfiguration<ProjectLabel>
    {
        public override void Configure(EntityTypeBuilder<ProjectLabel> builder)
        {
            base.Configure(builder);

            builder.ToTable("ProjectLabels");

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
        }
    }
}
