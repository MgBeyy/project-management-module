using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class TaskEntityMapping : _BaseEntityTypeConfiguration<TaskEntity>
    {
        public override void Configure(EntityTypeBuilder<TaskEntity> builder)
        {
            base.Configure(builder);

            builder.ToTable("Tasks");

            builder.HasIndex(t => t.Code).IsUnique();
            builder.Property(t => t.Code).IsRequired().HasMaxLength(50);

            builder.Property(t => t.ProjectId).IsRequired();
            builder.HasOne(t => t.Project)
                   .WithMany(p => p.Tasks)
                   .HasForeignKey(t => t.ProjectId);

            builder.Property(t => t.ParentTaskId).IsRequired(false);
            builder.HasOne(t => t.ParentTask).WithMany(t => t.SubTasks).HasForeignKey(t => t.ParentTaskId);

            builder.Property(t => t.Description).IsRequired(false);
            builder.Property(t => t.Title).IsRequired().HasMaxLength(256);

            builder.Property(t => t.Status).IsRequired().HasConversion<string>();

            builder.Property(t => t.PlannedHours).IsRequired(false).HasPrecision(18, 2);
            builder.Property(t => t.ActualHours).IsRequired(false).HasPrecision(18, 2);
            builder.Property(t => t.IsLast).IsRequired();
        }
    }
}
