using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.DTOs;
using PMM.Core.Exceptions;
using PMM.Core.Forms;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Data.Repositories;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public interface IUserService
    {
        Task<UserDto> AddUserAsync(CreateUserForm form);
        Task<UserDto> GetUserAsync(int userId);
        Task<UserDto> EditUserAsync(int userId, CreateUserForm form);
        Task DeleteUserAsync(int userId);
        Task<List<UserDto>> GetAllUsers();
    }
    public class UserService : _BaseService, IUserService
    {
        private readonly ILogger<UserService> _logger;
        public UserService(IUserRepository userRepository,
            ILogger<UserService> logger,
            IPrincipal principal)
            : base(principal, logger, userRepository)
        {
            _logger = logger;
        }

        public async Task<UserDto> AddUserAsync(CreateUserForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateUserForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            var userByEmail = await _userRepository.QueryAll()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == form.Email.ToLower());
            if (userByEmail is not null)
                throw new BusinessException("Bu email zaten kayıtlı!");

            var user = UserMapper.Map(form);
            _userRepository.Create(user);
            await _userRepository.SaveChangesAsync();
            return UserMapper.Map(user);
        }

        public async Task DeleteUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User Bulunamadı!");
            _userRepository.Delete(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task<UserDto> EditUserAsync(int userId, CreateUserForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateUserForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User Bulunamadı!");

            user.Name = form.Name != null ? form.Name : user.Name;
            user.Email = form.Email != null ? form.Email : user.Email;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
            return UserMapper.Map(user);
        }

        public async Task<List<UserDto>> GetAllUsers()
        {
            var users = _userRepository.QueryAll();
            return UserMapper.Map(await users.ToListAsync());
        }

        public async Task<UserDto> GetUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User Bulunamadı!");
            return UserMapper.Map(user);
        }
    }
}
