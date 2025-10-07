using System;

namespace PMM.Core.DTOs
{
    public class FileDto
    {
        public int Id { get; set; }
        public string File { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int ProjectId { get; set; }
        public int CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
