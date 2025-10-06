using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Data.Entities;

namespace PMM.Core.Mappers
{
    public class ClientMapper
    {
        public static Client Map(CreateClientForm form)
        {
            return new Client
            {
                Name = form.name
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
