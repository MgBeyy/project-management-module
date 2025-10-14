using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class TaskDependencyMapping : IEntityTypeConfiguration<TaskDependency>
    {
        public void Configure(EntityTypeBuilder<TaskDependency> builder)
        {
            builder.ToTable("TaskDependencies");
            builder.HasKey(td => td.Id);
            builder.Property(td => td.Id).ValueGeneratedOnAdd();

            builder.Property(td => td.BlockingTaskId).IsRequired();
            builder.HasOne(td => td.BlockingTask)
                   .WithMany(t => t.Blocks)
                   .HasForeignKey(td => td.BlockingTaskId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(td => td.BlockedTaskId).IsRequired();
            builder.HasOne(td => td.BlockedTask)
                   .WithMany(t => t.BlockedBy)
                   .HasForeignKey(td => td.BlockedTaskId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(td => td.CreatedAt).IsRequired();
            builder.Property(td => td.CreatedById).IsRequired();
            builder.HasOne(td => td.CreatedByUser)
                   .WithMany()
                   .HasForeignKey(td => td.CreatedById)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(td => td.UpdatedAt).IsRequired(false);
            builder.Property(td => td.UpdatedById).IsRequired(false);
            builder.HasOne(td => td.UpdatedByUser)
                   .WithMany()
                   .HasForeignKey(td => td.UpdatedById)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(td => new { td.BlockingTaskId, td.BlockedTaskId })
                   .IsUnique()
                   .HasDatabaseName("IX_TaskDependencies_BlockingTaskId_BlockedTaskId");
        }
    }
}