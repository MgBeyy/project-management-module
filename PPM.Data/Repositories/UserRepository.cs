using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface IUserRepository : _IBaseRepository<User>
    {
    }
    public class UserRepository : _BaseRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context, ILogger logger) : base(context, logger)
        {
        }
    }
}
