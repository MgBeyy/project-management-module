using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ProjectMapping : IEntityTypeConfiguration<Project>
    {
        public void Configure(EntityTypeBuilder<Project> builder)
        {
            builder.ToTable("Projects");
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).ValueGeneratedOnAdd();
            builder.HasIndex(p => p.Code).IsUnique();
            builder.Property(p => p.Title).IsRequired().HasMaxLength(256);
            builder.Property(p => p.PlannedStartDate).IsRequired();
            builder.Property(p => p.PlannedDeadline).IsRequired();
            builder.Property(p => p.PlannedHours).IsRequired();
            builder.Property(p => p.StartedAt).IsRequired(false);
            builder.Property(p => p.EndAt).IsRequired(false);
            builder.Property(p => p.Status).IsRequired().HasConversion<string>();
            builder.Property(p => p.Priority).IsRequired().HasConversion<string>();

            builder.Property(p => p.ParentProjectId).IsRequired(false);
            builder.HasOne(p => p.ParentProject).WithMany(parent => parent.ChildProjects).HasForeignKey(p => p.ParentProjectId);

            builder.Property(p => p.ClientId).IsRequired(false);
            builder.HasOne(p => p.Client).WithMany(c => c.Projects).HasForeignKey(p => p.ClientId);

            builder.Property(p => p.CreatedAt).IsRequired();
            builder.Property(p => p.CreatedById).IsRequired();
            builder.HasOne(p => p.CreatedByUser).WithMany().HasForeignKey(p => p.CreatedById);

            builder.Property(p => p.UpdatedAt).IsRequired(false);
            builder.Property(p => p.UpdatedById).IsRequired(false);
            builder.HasOne(p => p.UpdatedByUser).WithMany().HasForeignKey(p => p.UpdatedById);
        }
    }
}
