using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class TaskLabelMapping : _BaseEntityTypeConfiguration<TaskLabel>
    {
        public override void Configure(EntityTypeBuilder<TaskLabel> builder)
        {
            base.Configure(builder);

            builder.ToTable("TaskLabels");

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
                   .IsUnique()
                   .HasFilter(IsNotDeletedFilter);
        }
    }
}
