using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ActivityMapping : IEntityTypeConfiguration<Activity>
    {
        public void Configure(EntityTypeBuilder<Activity> builder)
        {
            builder.ToTable("Activities");
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id).ValueGeneratedOnAdd();

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

            builder.Property(a => a.CreatedAt).IsRequired();
            builder.Property(a => a.CreatedById).IsRequired();
            builder.HasOne(a => a.CreatedByUser)
                   .WithMany()
                   .HasForeignKey(a => a.CreatedById)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(a => a.UpdatedAt).IsRequired(false);
            builder.Property(a => a.UpdatedById).IsRequired(false);
            builder.HasOne(a => a.UpdatedByUser)
                   .WithMany()
                   .HasForeignKey(a => a.UpdatedById)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
