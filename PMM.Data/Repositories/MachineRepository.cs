using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class MachineRepository : _BaseRepository<Machine>, IMachineRepository
    {
        public MachineRepository(ApplicationDbContext context, ILogger<MachineRepository> logger) : base(context, logger)
        {
        }
    }
}