using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class LabelRepository : _BaseRepository<Label>, ILabelRepository
    {
        public LabelRepository(ApplicationDbContext context, ILogger<LabelRepository> logger)
             : base(context, logger)
        {
        }
    }
}
