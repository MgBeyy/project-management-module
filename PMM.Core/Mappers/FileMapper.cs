using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Data.Entities;

namespace PMM.Core.Mappers
{
    public static class FileMapper
    {
        public static FileEntity Map(CreateFileForm form)
        {
            return new FileEntity
            {
                Title = form.Title,
                Description = form.Description,
                ProjectId = form.ProjectId
            };
        }

        public static FileEntity Map(UpdateFileForm form, FileEntity entity)
        {
            entity.Title = form.Title;
            entity.Description = form.Description;
            return entity;
        }

        public static FileDto Map(FileEntity entity)
        {
            return new FileDto
            {
                Id = entity.Id,
                File = entity.File,
                Title = entity.Title,
                Description = entity.Description,
                ProjectId = entity.ProjectId,
                CreatedById = entity.CreatedById,
                CreatedAt = entity.CreatedAt,
                UpdatedById = entity.UpdatedById,
                UpdatedAt = entity.UpdatedAt
            };
        }

        public static List<FileDto> Map(List<FileEntity> entities)
        {
            return entities.Select(e => Map(e)).ToList();
        }
    }
}
