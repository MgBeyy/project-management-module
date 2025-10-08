using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Data.Entities;

namespace PMM.Data.Repositories
{
    public interface IFileRepository : _IBaseRepository<FileEntity>
    {
    }

    public class FileRepository : _BaseRepository<FileEntity>, IFileRepository
    {
        public FileRepository(ApplicationDbContext context, ILogger<FileRepository> logger)
            : base(context, logger)
        {
        }
    }
}
