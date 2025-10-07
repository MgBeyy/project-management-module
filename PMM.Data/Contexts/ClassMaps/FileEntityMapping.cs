using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class FileEntityMapping : IEntityTypeConfiguration<FileEntity>
    {
        public void Configure(EntityTypeBuilder<FileEntity> builder)
        {
            builder.ToTable("Files");
            builder.HasKey(f => f.Id);
            builder.Property(f => f.Id).ValueGeneratedOnAdd();
            builder.Property(f => f.File).IsRequired().HasMaxLength(512);
            builder.Property(f => f.Title).IsRequired().HasMaxLength(256);

            builder.Property(f => f.ProjectId).IsRequired();
            builder.HasOne(f => f.Project)
                .WithMany(p => p.Files)
                .HasForeignKey(f => f.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(f => f.CreatedAt).IsRequired();
            builder.Property(f => f.CreatedById).IsRequired();
            builder.HasOne(f => f.CreatedByUser)
                .WithMany()
                .HasForeignKey(f => f.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(f => f.UpdatedAt).IsRequired(false);
            builder.Property(f => f.UpdatedById).IsRequired(false);
            builder.HasOne(f => f.UpdatedByUser)
                .WithMany()
                .HasForeignKey(f => f.UpdatedById)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
