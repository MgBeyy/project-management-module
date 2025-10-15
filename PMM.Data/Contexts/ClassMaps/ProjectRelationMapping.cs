using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ProjectRelationMapping : _BaseEntityTypeConfiguration<ProjectRelation>
    {
        public override void Configure(EntityTypeBuilder<ProjectRelation> builder)
        {
            base.Configure(builder);

            builder.ToTable("ProjectRelations");

            builder.Property(pr => pr.ParentProjectId).IsRequired();
            builder.Property(pr => pr.ChildProjectId).IsRequired();

            builder.HasOne(pr => pr.ParentProject)
                   .WithMany(p => p.ChildRelations)
                   .HasForeignKey(pr => pr.ParentProjectId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(pr => pr.ChildProject)
                   .WithMany(p => p.ParentRelations)
                   .HasForeignKey(pr => pr.ChildProjectId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(pr => new { pr.ParentProjectId, pr.ChildProjectId })
                   .IsUnique();
        }
    }
}
