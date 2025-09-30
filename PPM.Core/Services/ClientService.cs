using PMM.Core.DTOs;
using PMM.Core.Exceptions;
using PMM.Core.Forms;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Data.Repositories;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public class ClientService : _BaseService, IClientService
    {
        private readonly IClientRepository _clientRepository;
        private readonly ILogger<ClientService> _logger;
        public ClientService(IClientRepository clientRepository,
            ILogger<ClientService> logger,
            IPrincipal principal)
            : base(principal, logger)
        {
            _clientRepository = clientRepository;
            _logger = logger;
        }

        public async Task AddClientAsync(CreateClientForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateClientForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            var client = ClientMapper.Map(form);
            _clientRepository.Create(client);
            await _clientRepository.SaveChangesAsync();
        }

        public async Task DeleteClientAsync(int clientId)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new NotFoundException("Client Bulunamadı!");
            _clientRepository.Delete(client);
            await _clientRepository.SaveChangesAsync();
        }

        public async Task<ClientDto> EditClientAsync(int clientId, CreateClientForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateClientForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            if (clientId == null)
                throw new ArgumentNullException("ClientId Boş Olamaz!");
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new NotFoundException("Client Bulunamadı!");
            client.Name = form.name;
            _clientRepository.Update(client);
            await _clientRepository.SaveChangesAsync();

            return ClientMapper.Map(client);
        }

        public async Task<ClientDto> GetClientAsync(int clientId)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new NotFoundException("Client Bulunamadı!");

            return ClientMapper.Map(client);
        }
        public async Task<List<ClientDto>> GetAllClients()
        {
            var clients = _clientRepository.QueryAll();

            return ClientMapper.Map(clients.ToList());
        }
    }
    public interface IClientService
    {
        Task AddClientAsync(CreateClientForm form);
        Task<ClientDto> GetClientAsync(int clientId);
        Task<ClientDto> EditClientAsync(int clientId, CreateClientForm form);
        Task DeleteClientAsync(int clientId);
        Task<List<ClientDto>> GetAllClients();
    }
}
