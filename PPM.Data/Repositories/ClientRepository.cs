using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface IClientRepository : _IBaseRepository<Client>
    {
        //Task AddClientAsync(Client client);
        //Task<Client> GetByIdWithDetailsAsync(int clientId);
        //Task<List<Client>> GetAllWithDetailsAsync();
        //Task<(IEnumerable<Client>, int)> QueryClientsAsync(int? pageNumber, int? pageSize, string? search);
        //Task<List<Client>> GetAllClientsAsync();
        //Task<IEnumerable<Client>> GetAllAsync();
    }


    public class ClientRepository : _BaseRepository<Client>, IClientRepository
    {
        public ClientRepository(ApplicationDbContext context, ILogger<ClientRepository> logger)
             : base(context, logger)
        {
        }

        //public async Task AddClientAsync(Client client)
        //{
        //    await _context.AddAsync(client);
        //}
    }
}

