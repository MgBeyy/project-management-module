using PMM.Domain.DTOs;

namespace PMM.Core.Mappers
{
    public class IdNameMapper
    {
        public static IdNameDto? Map(int? id, string? name)
        {
            if (id is null || name is null)
                return null;
            else
                return new IdNameDto
                {
                    Id = (int)id,
                    Name = name!
                };
        }
    }
}
