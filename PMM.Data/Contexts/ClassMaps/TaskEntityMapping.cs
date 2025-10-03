using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class TaskEntityMapping : IEntityTypeConfiguration<TaskEntity>
    {
        public void Configure(EntityTypeBuilder<TaskEntity> builder)
        {
            builder.ToTable("Tasks");
            builder.HasKey(t => t.Id);
            builder.Property(t => t.Id).ValueGeneratedOnAdd();

            builder.Property(t => t.ProjectId).IsRequired();
            builder.HasOne(t => t.Project)
                   .WithMany(p => p.Tasks)
                   .HasForeignKey(t => t.ProjectId);

            builder.Property(t => t.ParentTaskId).IsRequired(false);
            builder.HasOne(t => t.ParentTask).WithMany(t => t.SubTasks).HasForeignKey(t => t.ParentTaskId);

            builder.Property(t => t.Description).IsRequired(false);
            builder.Property(t => t.Title).IsRequired().HasMaxLength(256);

            builder.Property(t => t.Status).IsRequired().HasConversion<string>();

            builder.Property(t => t.CreatedAt).IsRequired();
            builder.Property(t => t.CreatedById).IsRequired();
            builder.HasOne(t => t.CreatedByUser).WithMany().HasForeignKey(t => t.CreatedById);

            builder.Property(t => t.UpdatedAt).IsRequired(false);
            builder.Property(t => t.UpdatedById).IsRequired(false);
            builder.HasOne(t => t.UpdatedByUser).WithMany().HasForeignKey(t => t.UpdatedById);

            builder.Property(t => t.Weight).IsRequired();
        }
    }
}
