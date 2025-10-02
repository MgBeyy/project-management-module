using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Core.Services;

namespace PMM.API.Controllers
{
    public class ClientController : _BaseController
    {
        private readonly IClientService _clientService;
        public ClientController(
             ILogger<ClientController> logger,
            IClientService clientService)
            : base(logger)
        {
            _clientService = clientService;
        }

        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<ApiResponse> Create(CreateClientForm form)
        {
            await _clientService.AddClientAsync(form);
            return new ApiResponse("Client created successfully", StatusCodes.Status200OK);
        }
        [ProducesResponseType(typeof(List<ClientDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> GetAll()
        {
            var clients = await _clientService.GetAllClients();
            return new ApiResponse(clients, StatusCodes.Status200OK);
        }
        [ProducesResponseType(typeof(ClientDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{clientId:int}")]
        public async Task<ApiResponse> GetById(int clientId)
        {
            var client = await _clientService.GetClientAsync(clientId);
            return new ApiResponse(client, StatusCodes.Status200OK);
        }
        [ProducesResponseType(typeof(ClientDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{clientId:int}")]
        public async Task<ApiResponse> EditClient(CreateClientForm form, int clientId)
        {
            var client = await _clientService.EditClientAsync(clientId, form);
            return new ApiResponse(client, StatusCodes.Status200OK);
        }
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("{clientId:int}")]
        public async Task<ApiResponse> DeleteClientAsync(int clientId)
        {
            await _clientService.DeleteClientAsync(clientId);
            return new ApiResponse("Client deleted successfully", StatusCodes.Status200OK);
        }
    }
}
