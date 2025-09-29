using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ProjectAssignmentMapping : IEntityTypeConfiguration<ProjectAssignment>
    {
        public void Configure(EntityTypeBuilder<ProjectAssignment> builder)
        {
            builder.ToTable("ProjectAssignments");
            builder.HasKey(pa => pa.Id);
            builder.Property(pa => pa.Id).ValueGeneratedOnAdd();
            builder.Property(pa => pa.StartedAt).IsRequired(false);
            builder.Property(pa => pa.EndAt).IsRequired(false);
            builder.Property(pa => pa.ExpectedHours).IsRequired(false);
            builder.Property(pa => pa.SpentHours).IsRequired(false);
            builder.Property(pa => pa.Role).IsRequired().HasConversion<string>();

            builder.Property(pa => pa.ProjectId).IsRequired();
            builder.HasOne(pa => pa.Project).WithMany(p => p.Assignments).HasForeignKey(pa => pa.ProjectId);


            builder.Property(pa => pa.UserId).IsRequired();
            builder.HasOne(pa => pa.User).WithMany(p => p.ProjectAssignments).HasForeignKey(pa => pa.UserId);


            builder.Property(p => p.CreatedAt).IsRequired();
            builder.Property(p => p.CreatedById).IsRequired();
            builder.HasOne(p => p.CreatedByUser).WithMany().HasForeignKey(p => p.CreatedById);

            builder.Property(p => p.UpdatedAt).IsRequired(false);
            builder.Property(p => p.UpdatedById).IsRequired(false);
            builder.HasOne(p => p.UpdatedByUser).WithMany().HasForeignKey(p => p.UpdatedById);

        }
    }
}
