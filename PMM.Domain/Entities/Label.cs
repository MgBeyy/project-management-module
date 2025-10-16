namespace PMM.Domain.Entities
{
    public class Label : _BaseEntity
    {
        public string Name { get; set; }
        public string? Color { get; set; }
        public string? Description { get; set; }

        public virtual ICollection<ProjectLabel> ProjectLabels { get; set; }
        public virtual ICollection<TaskLabel> TaskLabels { get; set; }
    }
}
