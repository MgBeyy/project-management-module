using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class TaskDependencyMapping : _BaseEntityTypeConfiguration<TaskDependency>
    {
        public override void Configure(EntityTypeBuilder<TaskDependency> builder)
        {
            base.Configure(builder);

            builder.ToTable("TaskDependencies");

            builder.Property(td => td.BlockingTaskId)
                   .IsRequired();

            builder.HasOne(td => td.BlockingTask)
                   .WithMany(t => t.Blocks)
                   .HasForeignKey(td => td.BlockingTaskId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(td => td.BlockedTaskId)
                   .IsRequired();

            builder.HasOne(td => td.BlockedTask)
                   .WithMany(t => t.BlockedBy)
                   .HasForeignKey(td => td.BlockedTaskId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(td => new { td.BlockingTaskId, td.BlockedTaskId })
                   .IsUnique()
                   .HasDatabaseName("IX_TaskDependencies_BlockingTaskId_BlockedTaskId")
                   .HasFilter(IsNotDeletedFilter);
        }
    }
}