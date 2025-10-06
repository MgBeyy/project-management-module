using PMM.Core.DTOs;

namespace PMM.Core.Mappers
{
    public class IdNameMapper
    {
        public static IdNameDto? Map(int? id, string? name)
        {
            if (id is null)
                return null;
            else
                return new IdNameDto
                {
                    Id = (int)id,
                    Name = name
                };
        }
    }
}
