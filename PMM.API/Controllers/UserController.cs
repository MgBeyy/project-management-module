
using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Core.Services;

namespace PMM.API.Controllers
{
    public class UserController : _BaseController
    {
        private readonly IUserService _userService;
        public UserController(ILogger<UserController> logger, IUserService userService) : base(logger)
        {
            _userService = userService;
        }
        [ProducesResponseType(typeof(List<UserDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<IActionResult> Create(CreateUserForm form)
        {
            var user = await _userService.AddUserAsync(form);
            return StatusCode(StatusCodes.Status201Created, new ApiResponse(user, StatusCodes.Status201Created));
        }
        [ProducesResponseType(typeof(List<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> GetAll()
        {
            var users = await _userService.GetAllUsers();
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
    }
}
