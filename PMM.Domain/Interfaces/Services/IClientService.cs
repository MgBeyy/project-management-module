using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface IClientService
    {
        Task AddClientAsync(CreateClientForm form);
        Task<ClientDto> GetClientAsync(int clientId);
        Task<ClientDto> EditClientAsync(int clientId, CreateClientForm form);
        Task DeleteClientAsync(int clientId);
        Task<PagedResult<ClientDto>> Query(QueryClientForm form);
    }
}
