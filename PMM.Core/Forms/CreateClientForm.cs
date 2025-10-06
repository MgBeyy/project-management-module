using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class CreateClientForm
    {
        [Required]
        public string name { get; set; }
    }
}
