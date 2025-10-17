using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Core.Mappers
{
    public class ClientMapper
    {
        public static Client Map(CreateClientForm form)
        {
            return new Client
            {
                Name = form.Name
            };
        }
        public static ClientDto Map(Client client)
        {
            return new ClientDto
            {
                Id = client.Id,
                Name = client.Name,
            };
        }
        public static List<ClientDto> Map(List<Client> clients)
        {
            return clients.Select(c => Map(c)).ToList();
        }
    }
}
