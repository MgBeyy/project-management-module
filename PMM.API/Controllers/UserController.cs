using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers
{
    public class UserController : _BaseController
    {
        private readonly IUserService _userService;
        public UserController(ILogger<UserController> logger, IUserService userService) : base(logger)
        {
            _userService = userService;
        }
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<IActionResult> Create(CreateUserForm form)
        {
            try
            {
                var user = await _userService.AddUserAsync(form);
                return StatusCode(StatusCodes.Status201Created, new ApiResponse(user, StatusCodes.Status201Created));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "User creation failed for email: {Email}", form?.Email);
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse("User creation failed", StatusCodes.Status500InternalServerError));
            }
        }
        [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> Query([FromQuery] QueryUserForm form)
        {
            var users = await _userService.Query(form);
            return new ApiResponse(users, StatusCodes.Status200OK);
        }
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{userId:int}")]
        public async Task<ApiResponse> GetUserById(int userId)
        {
            var user = await _userService.GetUserAsync(userId);
            return new ApiResponse(user, StatusCodes.Status200OK);
        }
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{userId:int}")]
        public async Task<ApiResponse> EditUser(CreateUserForm form, int userId)
        {
            var user = await _userService.EditUserAsync(userId, form);
            return new ApiResponse(user, StatusCodes.Status200OK);
        }
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("{userId:int}")]
        public async Task<ApiResponse> DeleteUserAsync(int userId)
        {
            await _userService.DeleteUserAsync(userId);
            return new ApiResponse("User deleted successfully", StatusCodes.Status200OK);
        }

        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{userId:int}/deactivate")]
        public async Task<ApiResponse> DeactivateUserAsync(int userId)
        {
            await _userService.DeactivateUserAsync(userId);
            return new ApiResponse("User deactivated successfully", StatusCodes.Status200OK);
        }
    }
}
