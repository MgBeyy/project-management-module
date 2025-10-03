using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class TaskAssignmentMapping : IEntityTypeConfiguration<TaskAssignment>
    {
        public void Configure(EntityTypeBuilder<TaskAssignment> builder)
        {
            builder.ToTable("TaskAssignments");
            builder.HasKey(ta => ta.Id);
            builder.Property(ta => ta.Id).ValueGeneratedOnAdd();

            builder.Property(ta => ta.TaskId).IsRequired();
            builder.HasOne(ta => ta.Task).WithMany(t => t.TaskAssignments).HasForeignKey(ta => ta.TaskId);

            builder.Property(ta => ta.UserId).IsRequired();
            builder.HasOne(ta => ta.User).WithMany(u => u.TaskAssignments).HasForeignKey(ta => ta.UserId);

            builder.Property(ta => ta.CreatedAt).IsRequired();
            builder.Property(ta => ta.CreatedById).IsRequired();
            builder.HasOne(ta => ta.CreatedByUser).WithMany().HasForeignKey(ta => ta.CreatedById);

            builder.Property(ta => ta.UpdatedAt).IsRequired(false);
            builder.Property(ta => ta.UpdatedById).IsRequired(false);
            builder.HasOne(ta => ta.UpdatedByUser).WithMany().HasForeignKey(ta => ta.UpdatedById);
        }
    }
}
