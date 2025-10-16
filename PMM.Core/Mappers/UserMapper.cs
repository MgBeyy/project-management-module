using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Core.Mappers
{
    public class UserMapper
    {
        public static User Map(CreateUserForm form)
        {
            return new User
            {
                Name = form.Name,
                Email = form.Email.ToLower(),
            };
        }
        public static UserDto Map(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
            };
        }
        public static List<UserDto> Map(List<User> users)
        {
            return users.Select(u => Map(u)).ToList();
        }
    }
}
