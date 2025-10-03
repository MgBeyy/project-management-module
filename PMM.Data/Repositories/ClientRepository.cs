using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface IClientRepository : _IBaseRepository<Client>
    {
    }
    public class ClientRepository : _BaseRepository<Client>, IClientRepository
    {
        public ClientRepository(ApplicationDbContext context, ILogger<ClientRepository> logger)
             : base(context, logger)
        {
        }
    }
}

