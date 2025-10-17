using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.Common;
using PMM.Core.Exceptions;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Security.Principal;


namespace PMM.Core.Services
{
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
                .FirstOrDefaultAsync(u => EF.Functions.ILike(u.Email, form.Email));
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

        public async Task<UserDto> GetUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User Bulunamadı!");
            return UserMapper.Map(user);
        }

        public async Task<PagedResult<UserDto>> Query(QueryUserForm form)
        {
            IQueryable<User> query = _userRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(e =>
                    e.Name.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    e.Email.ToLower().Contains(form.Search.Trim().ToLower()));
            }

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;

            int totalRecords = await query.CountAsync();

            var users = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<UserDto>
            {
                Data = UserMapper.Map(users),
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
