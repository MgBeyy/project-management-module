using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class UserRepository : _BaseRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context, ILogger<UserRepository> logger) : base(context, logger)
        {
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _context.Set<User>()
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<List<User>> GetByIdsAsync(IEnumerable<int> ids)
        {
            return await Task.FromResult(_dbSet.Where(u => ids.Contains(u.Id)).ToList());
        }
    }
}
