using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ActivityMapping : _BaseEntityTypeConfiguration<Activity>
    {
        public override void Configure(EntityTypeBuilder<Activity> builder)
        {
            base.Configure(builder);

            builder.ToTable("Activities");

            builder.Property(a => a.TaskId).IsRequired();
            builder.HasOne(a => a.Task)
                   .WithMany(t => t.Activities)
                   .HasForeignKey(a => a.TaskId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(a => a.UserId).IsRequired();
            builder.HasOne(a => a.User)
                   .WithMany(u => u.Activities)
                   .HasForeignKey(a => a.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(a => a.Description).IsRequired().HasMaxLength(1000);

            builder.Property(a => a.StartTime).IsRequired();
            builder.Property(a => a.EndTime).IsRequired();

            builder.Property(a => a.TotalHours).IsRequired().HasPrecision(18, 2);
        }
    }
}
