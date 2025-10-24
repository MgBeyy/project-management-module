using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.Common;
using PMM.Core.Exceptions;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public class ClientService : _BaseService, IClientService
    {
        private readonly IClientRepository _clientRepository;
        private readonly ILogger<ClientService> _logger;
        public ClientService(IClientRepository clientRepository,
            ILogger<ClientService> logger,
            IUserRepository userRepository,
            IPrincipal principal)
            : base(principal, logger, userRepository)
        {
            _clientRepository = clientRepository;
            _logger = logger;
        }

        public async Task AddClientAsync(CreateClientForm form)
        {
            try
            {
                _logger.LogInformation("Starting AddClientAsync with form: {@Form}", form);

                if (form == null)
                    throw new ArgumentNullException($"{typeof(CreateClientForm)} is empty");

                var validation = FormValidator.Validate(form);
                if (!validation.IsValid)
                    throw new BusinessException(validation.ErrorMessage);

                _logger.LogInformation("Creating client entity for: {Name}", form.Name);
                var client = ClientMapper.Map(form);

                _logger.LogInformation("Saving client to database: {Name}", client.Name);
                _clientRepository.Create(client);
                await _clientRepository.SaveChangesAsync();

                _logger.LogInformation("Client created successfully with ID: {Id}", client.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddClientAsync");
                throw;
            }
        }

        public async Task DeleteClientAsync(int clientId)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new NotFoundException("Müşteri Bulunamadı!");
            _clientRepository.Delete(client);
            await _clientRepository.SaveChangesAsync();
        }

        public async Task<ClientDto> EditClientAsync(int clientId, CreateClientForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateClientForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new NotFoundException("Müşteri Bulunamadı!");

            client.Name = form.Name;
            _clientRepository.Update(client);
            await _clientRepository.SaveChangesAsync();

            return ClientMapper.Map(client);
        }

        public async Task<ClientDto> GetClientAsync(int clientId)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new NotFoundException("Müşteri Bulunamadı!");

            return ClientMapper.Map(client);
        }

        public async Task<PagedResult<ClientDto>> Query(QueryClientForm form)
        {
            var query = _clientRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(c =>
                    c.Name.ToLower().Contains(form.Search.Trim().ToLower()));
            }

            if (form.Id.HasValue)
                query = query.Where(c => c.Id == form.Id.Value);

            if (!string.IsNullOrWhiteSpace(form.Name))
                query = query.Where(c => c.Name.ToLower().Contains(form.Name.Trim().ToLower()));

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;

            int totalRecords = await query.CountAsync();

            var clients = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<ClientDto>
            {
                Data = ClientMapper.Map(clients),
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
