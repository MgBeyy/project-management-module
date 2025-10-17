using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class FileEntityMapping : _BaseEntityTypeConfiguration<FileEntity>
    {
        public override void Configure(EntityTypeBuilder<FileEntity> builder)
        {
            base.Configure(builder);

            builder.ToTable("Files");
            builder.Property(f => f.File).IsRequired().HasMaxLength(512);
            builder.Property(f => f.Title).IsRequired().HasMaxLength(256);

            builder.Property(f => f.ProjectId).IsRequired();
            builder.HasOne(f => f.Project)
                .WithMany(p => p.Files)
                .HasForeignKey(f => f.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
