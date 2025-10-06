using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Common
{
    public class BasePaginationForm
    {

        [Range(1, int.MaxValue, ErrorMessage = "{0} En az 1 olmalı.")]
        public int? Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "{0} 1 ile 100 aralığında olmalı.")]
        public int? PageSize { get; set; } = 10;
    }
}
