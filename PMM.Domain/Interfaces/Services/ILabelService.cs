using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface ILabelService
    {
        Task<LabelDto> AddLabelAsync(CreateLabelForm form);
        Task<LabelDto> GetLabelAsync(int labelId);
        Task<LabelDto> EditLabelAsync(int labelId, UpdateLabelForm form);
        Task DeleteLabelAsync(int labelId);
        Task<PagedResult<LabelDto>> Query(QueryLabelForm form);
    }
}
