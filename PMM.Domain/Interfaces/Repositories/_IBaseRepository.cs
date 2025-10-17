using System.Linq.Expressions;


namespace PMM.Domain.Interfaces.Repositories
{
    public interface _IBaseRepository<TEntity> where TEntity : class
    {
        IQueryable<TEntity> Query(
            Expression<Func<TEntity, bool>>? filter = null,
            params Expression<Func<TEntity, object>>[]? includes);

        IQueryable<TEntity> QueryAll(
            params Expression<Func<TEntity, object>>[]? includes);

        IEnumerable<TEntity> Get(
            Expression<Func<TEntity, bool>>? filter = null,
            params Expression<Func<TEntity, object>>[]? includes);

        Task<TEntity> GetByIdAsync(object id);

        TEntity? GetById(object id);

        void Create(TEntity entity);

        Task CreateRangeAsync(IEnumerable<TEntity> entities);

        void Delete(TEntity entityToDelete);

        void Update(TEntity entityToUpdate);

        Task<int> SaveChangesAsync();

        int SaveChanges();
    }
}