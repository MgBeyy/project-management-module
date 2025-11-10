using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Domain.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class ReportMapping : _BaseEntityTypeConfiguration<Report>
    {
        public override void Configure(EntityTypeBuilder<Report> builder)
        {
            base.Configure(builder);

            builder.ToTable("Reports");
            builder.Property(r => r.Name).IsRequired().HasMaxLength(256);
            builder.Property(r => r.File).IsRequired().HasMaxLength(512);
        }
    }
}