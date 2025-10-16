using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Forms
{
    public class CreateClientForm
    {
        [Required]
        public string Name { get; set; }
    }
}
