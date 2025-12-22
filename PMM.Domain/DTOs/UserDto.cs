namespace PMM.Domain.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public decimal Capacity { get; set; } // User's available capacity in hours for the next 30 days
    }
}
