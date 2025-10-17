using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ProjectAssignmentMapping : _BaseEntityTypeConfiguration<ProjectAssignment>
    {
        public override void Configure(EntityTypeBuilder<ProjectAssignment> builder)
        {
            base.Configure(builder);

            builder.ToTable("ProjectAssignments");
            builder.Property(pa => pa.StartedAt).IsRequired(false).HasColumnType("date");
            builder.Property(pa => pa.EndAt).IsRequired(false).HasColumnType("date");
            builder.Property(pa => pa.ExpectedHours).IsRequired(false);
            builder.Property(pa => pa.SpentHours).IsRequired(false);
            builder.Property(pa => pa.Role).IsRequired().HasConversion<string>();

            builder.Property(pa => pa.ProjectId).IsRequired();
            builder.HasOne(pa => pa.Project).WithMany(p => p.Assignments).HasForeignKey(pa => pa.ProjectId);

            builder.Property(pa => pa.UserId).IsRequired();
            builder.HasOne(pa => pa.User).WithMany(p => p.ProjectAssignments).HasForeignKey(pa => pa.UserId);
        }
    }
}
