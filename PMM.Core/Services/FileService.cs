using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.Common;
using PMM.Core.Exceptions;
using PMM.Core.Mappers;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public class FileService : _BaseService, IFileService
    {
        private readonly IFileRepository _fileRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly ILogger<FileService> _logger;
        private readonly string _basePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Files");

        public FileService(IFileRepository fileRepository,
            IProjectRepository projectRepository,
            ILogger<FileService> logger,
            IUserRepository userRepository,
            IPrincipal principal)
            : base(principal, logger, userRepository)
        {
            _fileRepository = fileRepository;
            _projectRepository = projectRepository;
            _logger = logger;
            if (!Directory.Exists(_basePath))
                Directory.CreateDirectory(_basePath);
        }

        public async Task<FileDto> AddFileAsync(CreateFileForm form)
        {
            if (form == null)
                throw new ArgumentNullException("CreateFileForm is empty");
            _ = await _projectRepository.GetByIdAsync(form.ProjectId) ?? throw new NotFoundException("Proje Bulunamadı!");
            if (form.FileContent == null || form.FileContent.Length == 0)
                throw new ArgumentException("Dosya içeriği boş!");
            var extension = Path.GetExtension(form.FileContent.FileName);
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var fileNameWithExtension = string.IsNullOrWhiteSpace(extension)
                ? $"{form.Title}_{timestamp}"
                : $"{form.Title}_{timestamp}{extension}";
            var filePath = Path.Combine(_basePath, fileNameWithExtension);
            using (var ms = new MemoryStream())
            {
                await form.FileContent.CopyToAsync(ms);
                await File.WriteAllBytesAsync(filePath, ms.ToArray());
            }
            var fileEntity = FileMapper.Map(form);
            fileEntity.File = filePath;
            fileEntity.CreatedById = LoggedInUser.Id;
            fileEntity.CreatedAt = DateTime.UtcNow;
            _fileRepository.Create(fileEntity);
            await _fileRepository.SaveChangesAsync();
            return FileMapper.Map(fileEntity);
        }

        public async Task<FileDto> GetFileAsync(int fileId)
        {
            var file = await _fileRepository.GetByIdAsync(fileId);
            if (file == null)
                throw new NotFoundException("Dosya Bulunamadı!");
            return FileMapper.Map(file);
        }

        public async Task<FileDto> EditFileAsync(int fileId, UpdateFileForm form)
        {
            if (form == null)
                throw new ArgumentNullException("UpdateFileForm is empty");
            var file = await _fileRepository.GetByIdAsync(fileId);
            if (file == null)
                throw new NotFoundException("Dosya Bulunamadı!");
            file.Title = form.Title;
            file.Description = form.Description;
            file.UpdatedAt = DateTime.UtcNow;
            file.UpdatedById = LoggedInUser.Id;
            _fileRepository.Update(file);
            await _fileRepository.SaveChangesAsync();
            return FileMapper.Map(file);
        }

        public async Task DeleteFileAsync(int fileId)
        {
            var file = await _fileRepository.GetByIdAsync(fileId);
            if (file == null)
                throw new NotFoundException("Dosya Bulunamadı!");
            if (File.Exists(file.File))
                File.Delete(file.File);
            _fileRepository.Delete(file);
            await _fileRepository.SaveChangesAsync();
        }

        public async Task<PagedResult<FileDto>> Query(QueryFileForm form)
        {
            var query = _fileRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(f =>
                    f.Title.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    (f.Description != null && f.Description.ToLower().Contains(form.Search.Trim().ToLower())));
            }

            if (form.Id.HasValue)
                query = query.Where(e => e.Id == form.Id.Value);

            if (!string.IsNullOrWhiteSpace(form.Title))
                query = query.Where(e => e.Title.ToLower().Contains(form.Title.Trim().ToLower()));

            if (!string.IsNullOrWhiteSpace(form.Description))
                query = query.Where(e => e.Description != null && e.Description.ToLower().Contains(form.Description.Trim().ToLower()));

            if (form.ProjectId.HasValue)
                query = query.Where(e => e.ProjectId == form.ProjectId.Value);

            if (form.CreatedById.HasValue)
                query = query.Where(e => e.CreatedById == form.CreatedById.Value);

            if (form.CreatedAt.HasValue)
                query = query.Where(e => e.CreatedAt == form.CreatedAt);
            if (form.CreatedAtMin.HasValue)
                query = query.Where(e => e.CreatedAt >= form.CreatedAtMin);
            if (form.CreatedAtMax.HasValue)
                query = query.Where(e => e.CreatedAt <= form.CreatedAtMax);

            if (form.UpdatedById.HasValue)
                query = query.Where(e => e.UpdatedById == form.UpdatedById.Value);

            if (form.UpdatedAt.HasValue)
                query = query.Where(e => e.UpdatedAt == form.UpdatedAt);
            if (form.UpdatedAtMin.HasValue)
                query = query.Where(e => e.UpdatedAt >= form.UpdatedAtMin);
            if (form.UpdatedAtMax.HasValue)
                query = query.Where(e => e.UpdatedAt <= form.UpdatedAtMax);

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;

            int totalRecords = await query.CountAsync();

            var files = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<FileDto>
            {
                Data = FileMapper.Map(files),
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
