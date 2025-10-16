using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class FileRepository : _BaseRepository<FileEntity>, IFileRepository
    {
        public FileRepository(ApplicationDbContext context, ILogger<FileRepository> logger)
            : base(context, logger)
        {
        }
    }
}
