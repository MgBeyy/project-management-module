using Microsoft.EntityFrameworkCore;
using PMM.Domain.Interfaces;
using PMM.Domain.Security;

namespace PMM.Data.Contexts
{
    public class ApplicationDbContext : DbContext
    {
        private readonly IAppPrincipal _principal;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            IAppPrincipal principal)
            : base(options)
        {
            _principal = principal;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }

        public override int SaveChanges()
        {
            OnBeforeSaving();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            OnBeforeSaving();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void OnBeforeSaving()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added ||
                            e.State == EntityState.Modified ||
                            e.State == EntityState.Deleted);

            var currentUserId = _principal?.Id ?? 0;
            var now = DateTime.UtcNow;

            foreach (var entry in entries)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        if (entry.Entity is IAuditable auditableAdded)
                        {
                            auditableAdded.CreatedAt = now;
                            auditableAdded.CreatedById = currentUserId;
                            auditableAdded.UpdatedAt = null;
                            auditableAdded.UpdatedById = null;
                        }
                        break;

                    case EntityState.Modified:
                        if (entry.Entity is IAuditable auditableModified)
                        {
                            auditableModified.UpdatedAt = now;
                            auditableModified.UpdatedById = currentUserId;

                            entry.Property(nameof(IAuditable.CreatedAt)).IsModified = false;
                            entry.Property(nameof(IAuditable.CreatedById)).IsModified = false;
                        }
                        break;

                    case EntityState.Deleted:
                        if (entry.Entity is ISoftDeletable softDeletable)
                        {
                            entry.State = EntityState.Modified;

                            softDeletable.IsDeleted = true;
                            softDeletable.DeletedAt = now;
                            softDeletable.DeletedById = currentUserId;

                            if (entry.Entity is IAuditable auditableDeleted)
                            {
                                entry.Property(nameof(IAuditable.UpdatedAt)).IsModified = false;
                                entry.Property(nameof(IAuditable.UpdatedById)).IsModified = false;
                                entry.Property(nameof(IAuditable.CreatedAt)).IsModified = false;
                                entry.Property(nameof(IAuditable.CreatedById)).IsModified = false;
                            }
                        }
                        break;
                }
            }
        }
    }
}