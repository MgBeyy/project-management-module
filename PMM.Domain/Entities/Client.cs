namespace PMM.Domain.Entities
{
    public class Client : _BaseEntity
    {
        public string Name { get; set; }
        public virtual ICollection<Project> Projects { get; set; }
    }
}
