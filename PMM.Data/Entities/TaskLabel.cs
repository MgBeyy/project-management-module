namespace PMM.Data.Entities
{
    public class TaskLabel : _BaseEntity
    {
        public int TaskId { get; set; }
        public virtual TaskEntity Task { get; set; }

        public int LabelId { get; set; }
        public virtual Label Label { get; set; }
    }
}
