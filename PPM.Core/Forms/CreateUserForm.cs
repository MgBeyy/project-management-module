using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class CreateUserForm
    {
        [Required]
        public string Name { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
