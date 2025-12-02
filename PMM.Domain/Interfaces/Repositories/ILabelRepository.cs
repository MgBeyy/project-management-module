using PMM.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PMM.Domain.Interfaces.Repositories
{
    public interface ILabelRepository : _IBaseRepository<Label>
    {
        Task<List<Label>> GetByIdsAsync(IEnumerable<int> ids);
    }
}