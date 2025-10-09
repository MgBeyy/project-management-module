using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class TaskLabelMapping : IEntityTypeConfiguration<TaskLabel>
    {
        public void Configure(EntityTypeBuilder<TaskLabel> builder)
        {
            builder.ToTable("TaskLabels");
            builder.HasKey(tl => tl.Id);
            builder.Property(tl => tl.Id).ValueGeneratedOnAdd();

            builder.Property(tl => tl.TaskId).IsRequired();
            builder.Property(tl => tl.LabelId).IsRequired();

            builder.HasOne(tl => tl.Task)
                   .WithMany(t => t.TaskLabels)
                   .HasForeignKey(tl => tl.TaskId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(tl => tl.Label)
                   .WithMany(l => l.TaskLabels)
                   .HasForeignKey(tl => tl.LabelId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(tl => new { tl.TaskId, tl.LabelId })
                   .IsUnique();

            builder.Property(tl => tl.CreatedAt).IsRequired();
            builder.Property(tl => tl.CreatedById).IsRequired();
            builder.HasOne(tl => tl.CreatedByUser)
                   .WithMany()
                   .HasForeignKey(tl => tl.CreatedById)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(tl => tl.UpdatedAt).IsRequired(false);
            builder.Property(tl => tl.UpdatedById).IsRequired(false);
            builder.HasOne(tl => tl.UpdatedByUser)
                   .WithMany()
                   .HasForeignKey(tl => tl.UpdatedById)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
