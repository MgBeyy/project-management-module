namespace PMM.Data.Entities
{
    public class ProjectLabel
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public virtual Project Project { get; set; }

        public int LabelId { get; set; }
        public virtual Label Label { get; set; }

        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
