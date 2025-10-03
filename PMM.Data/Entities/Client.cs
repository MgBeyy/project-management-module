namespace PMM.Data.Entities
{
    public class Client
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<Project> Projects { get; set; }
    }
}
