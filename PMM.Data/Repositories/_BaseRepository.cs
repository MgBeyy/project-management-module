using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Interfaces.Repositories;
using System.Linq.Expressions;


namespace PMM.Data.Repositories
{
    public abstract class _BaseRepository<TEntity> : _IBaseRepository<TEntity> where TEntity : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<TEntity> _dbSet;
        protected readonly ILogger _logger;

        public _BaseRepository(ApplicationDbContext context, ILogger logger)
        {
            _context = context;
            _dbSet = context.Set<TEntity>();
            _logger = logger;
        }

        public virtual IEnumerable<TEntity> Get(
            Expression<Func<TEntity, bool>>? filter,
            params Expression<Func<TEntity, object>>[]? includes)
        {
            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
                query = query.Where(filter);

            foreach (var include in includes)
                query = query.Include(include);

            return query.ToList();
        }

        public virtual IQueryable<TEntity> Query(
            Expression<Func<TEntity, bool>>? filter,
             params Expression<Func<TEntity, object>>[]? includes)
        {
            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
                query = query.Where(filter);

            foreach (var include in includes)
                query = query.Include(include);

            return query;
        }

        public virtual IQueryable<TEntity> QueryAll(
            params Expression<Func<TEntity, object>>[]? includes)
        {
            return Query(x => true, includes);
        }

        public virtual async Task<TEntity> GetByIdAsync(object id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual TEntity? GetById(object id)
        {
            return _dbSet.Find(id);
        }

        public virtual void Create(TEntity entity)
        {
            _dbSet.Add(entity);
        }
        public async virtual Task CreateRangeAsync(IEnumerable<TEntity> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public virtual void Delete(TEntity entityToDelete)
        {
            if (_context.Entry(entityToDelete).State == EntityState.Detached)
            {
                _dbSet.Attach(entityToDelete);
            }
            _dbSet.Remove(entityToDelete);
        }

        public virtual void Update(TEntity entityToUpdate)
        {
            _dbSet.Attach(entityToUpdate);
            _context.Entry(entityToUpdate).State = EntityState.Modified;
        }

        public virtual async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public virtual int SaveChanges()
        {
            return _context.SaveChanges();
        }
    }
}