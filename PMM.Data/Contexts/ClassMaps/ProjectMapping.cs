using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ProjectMapping : _BaseEntityTypeConfiguration<Project>
    {
        public override void Configure(EntityTypeBuilder<Project> builder)
        {
            base.Configure(builder);

            builder.ToTable("Projects");

            builder.HasIndex(p => p.Code).IsUnique();
            builder.Property(p => p.Code).IsRequired().HasMaxLength(50);

            builder.Property(p => p.Title).IsRequired().HasMaxLength(256);

            builder.Property(p => p.PlannedStartDate).IsRequired(false).HasColumnType("date");
            builder.Property(p => p.PlannedDeadline).IsRequired(false).HasColumnType("date");

            builder.Property(p => p.PlannedHours).IsRequired(false);

            builder.Property(p => p.ActualHours).IsRequired(false).HasPrecision(18, 2);

            builder.Property(p => p.StartedAt).IsRequired(false).HasColumnType("date");
            builder.Property(p => p.EndAt).IsRequired(false).HasColumnType("date");

            builder.Property(p => p.Status).IsRequired().HasConversion<string>();
            builder.Property(p => p.Priority).IsRequired().HasConversion<string>();
            builder.Property(p => p.Type).IsRequired(false).HasConversion<string>();

            builder.Property(p => p.ClientId).IsRequired(false);
            builder.HasOne(p => p.Client).WithMany(c => c.Projects).HasForeignKey(p => p.ClientId);
        }
    }
}