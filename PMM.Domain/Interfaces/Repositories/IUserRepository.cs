using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface IUserRepository : _IBaseRepository<User>
    {
        Task<bool> IsEmailExistsAsync(string email);
        Task<List<User>> GetByIdsAsync(IEnumerable<int> ids);
    }
}
