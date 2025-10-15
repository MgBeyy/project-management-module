namespace PMM.Data.Entities
{
    public class FileEntity : _BaseEntity
    {
        public string File { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }

        public int ProjectId { get; set; }
        public virtual Project Project { get; set; }
    }
}
