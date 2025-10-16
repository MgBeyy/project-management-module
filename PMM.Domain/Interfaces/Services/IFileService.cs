using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface IFileService
    {
        Task<FileDto> AddFileAsync(CreateFileForm form);
        Task<FileDto> GetFileAsync(int fileId);
        Task<FileDto> EditFileAsync(int fileId, UpdateFileForm form);
        Task DeleteFileAsync(int fileId);
        Task<PagedResult<FileDto>> Query(QueryFileForm form);
    }
}
