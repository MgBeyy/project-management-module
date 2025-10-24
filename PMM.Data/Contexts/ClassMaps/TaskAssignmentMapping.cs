using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class TaskAssignmentMapping : _BaseEntityTypeConfiguration<TaskAssignment>
    {
        public override void Configure(EntityTypeBuilder<TaskAssignment> builder)
        {
            base.Configure(builder);

            builder.ToTable("TaskAssignments");

            builder.Property(ta => ta.TaskId).IsRequired();
            builder.HasOne(ta => ta.Task).WithMany(t => t.TaskAssignments).HasForeignKey(ta => ta.TaskId);

            builder.Property(ta => ta.UserId).IsRequired();
            builder.HasOne(ta => ta.User).WithMany(u => u.TaskAssignments).HasForeignKey(ta => ta.UserId);

            builder.HasIndex(ta => new { ta.UserId, ta.TaskId })
                   .IsUnique()
                   .HasDatabaseName("IX_TaskAssignments_UserId_TaskId_Unique")
                   .HasFilter(IsNotDeletedFilter);
        }
    }
}
