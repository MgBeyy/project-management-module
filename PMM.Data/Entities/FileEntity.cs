namespace PMM.Data.Entities
{
    public class FileEntity
    {
        public int Id { get; set; }
        public string File { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }

        public int ProjectId { get; set; }
        public virtual Project Project { get; set; }

        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }
    }
}
