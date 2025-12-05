using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface IUserService
    {
        Task<UserDto> AddUserAsync(CreateUserForm form);
        Task<UserDto> GetUserAsync(int userId);
        Task<UserDto> EditUserAsync(int userId, CreateUserForm form);
        Task DeleteUserAsync(int userId);
        Task<PagedResult<UserDto>> Query(QueryUserForm form);
        Task DeactivateUserAsync(int userId);
    }
}
