using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ProjectRelationMapping : IEntityTypeConfiguration<ProjectRelation>
    {
        public void Configure(EntityTypeBuilder<ProjectRelation> builder)
        {
            builder.ToTable("ProjectRelations");
            builder.HasKey(pr => pr.Id);
            builder.Property(pr => pr.Id).ValueGeneratedOnAdd();

            builder.Property(pr => pr.ParentProjectId).IsRequired();
            builder.Property(pr => pr.ChildProjectId).IsRequired();

            // Parent-Child iliþkisi
            builder.HasOne(pr => pr.ParentProject)
                   .WithMany(p => p.ChildRelations)
                   .HasForeignKey(pr => pr.ParentProjectId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(pr => pr.ChildProject)
                   .WithMany(p => p.ParentRelations)
                   .HasForeignKey(pr => pr.ChildProjectId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Ayný parent-child kombinasyonunun tekrar eklenmesini engelle
            builder.HasIndex(pr => new { pr.ParentProjectId, pr.ChildProjectId })
                   .IsUnique();

            builder.Property(pr => pr.CreatedAt).IsRequired();
            builder.Property(pr => pr.CreatedById).IsRequired();
            builder.HasOne(pr => pr.CreatedByUser)
                   .WithMany()
                   .HasForeignKey(pr => pr.CreatedById)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(pr => pr.UpdatedAt).IsRequired(false);
            builder.Property(pr => pr.UpdatedById).IsRequired(false);
            builder.HasOne(pr => pr.UpdatedByUser)
                   .WithMany()
                   .HasForeignKey(pr => pr.UpdatedById)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
