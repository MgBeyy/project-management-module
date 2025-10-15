namespace PMM.Data.Entities
{
    public class ProjectLabel : _BaseEntity
    {
        public int ProjectId { get; set; }
        public virtual Project Project { get; set; }

        public int LabelId { get; set; }
        public virtual Label Label { get; set; }
    }
}
