using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMM.Data.Entities;

namespace PMM.Data.Contexts.ClassMaps
{
    public class UserMapping : _BaseEntityTypeConfiguration<User>
    {
        public override void Configure(EntityTypeBuilder<User> builder)
        {
            base.Configure(builder);

            builder.ToTable("Users");
            builder.Property(u => u.Name).IsRequired().HasMaxLength(256);
            builder.HasIndex(u => u.Email).IsUnique();
        }
    }
}