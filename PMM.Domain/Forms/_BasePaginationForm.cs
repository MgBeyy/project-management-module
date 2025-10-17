using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Common
{
    public class _BasePaginationForm
    {

        [Range(1, int.MaxValue, ErrorMessage = "{0} En az 1 olmalı.")]
        public int? Page { get; set; } = 1;

        [Range(1, int.MaxValue, ErrorMessage = "{0} En az 1 olmalı.")]
        public int? PageSize { get; set; } = 10;
    }
}
