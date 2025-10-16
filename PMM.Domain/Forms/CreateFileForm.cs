using Microsoft.AspNetCore.Http;

namespace PMM.Domain.Forms
{
    public class CreateFileForm
    {
        public IFormFile FileContent { get; set; }
        public int ProjectId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
    }
}
