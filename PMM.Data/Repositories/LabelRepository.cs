using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface ILabelRepository : _IBaseRepository<Label>
    {
    }

    public class LabelRepository : _BaseRepository<Label>, ILabelRepository
    {
        public LabelRepository(ApplicationDbContext context, ILogger<LabelRepository> logger)
             : base(context, logger)
        {
        }
    }
}
