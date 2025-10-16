using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class ClientRepository : _BaseRepository<Client>, IClientRepository
    {
        public ClientRepository(ApplicationDbContext context, ILogger<ClientRepository> logger)
             : base(context, logger)
        {
        }
    }
}

