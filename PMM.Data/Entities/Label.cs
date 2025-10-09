namespace PMM.Data.Entities
{
    public class Label
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Color { get; set; }
        public string? Description { get; set; }

        public virtual ICollection<ProjectLabel> ProjectLabels { get; set; }
        public virtual ICollection<TaskLabel> TaskLabels { get; set; }

        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
