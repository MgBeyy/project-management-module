using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Core.Services;

namespace PMM.API.Controllers
{
    public class ProjectAssignmentController : _BaseController
    {
        private readonly IProjectAssignmentService _projectAssignmentService;
        public ProjectAssignmentController(
            ILogger<ProjectAssignmentController> logger,
            IProjectAssignmentService projectAssignmentService) : base(logger)
        {
            _projectAssignmentService = projectAssignmentService;
        }

        [ProducesResponseType(typeof(ProjectAssignmentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<ApiResponse> Create(CreateProjectAssignmentForm form)
        {
            var assignment = await _projectAssignmentService.AddProjectAssignmentAsync(form);
            return new ApiResponse(assignment, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(List<ProjectAssignmentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> GetAll()
        {
            var assignments = await _projectAssignmentService.GetAllProjectAssignments();
            return new ApiResponse(assignments, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(ProjectAssignmentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{projectAssignmentId:int}")]
        public async Task<ApiResponse> GetById(int projectAssignmentId)
        {
            var assignment = await _projectAssignmentService.GetProjectAssignmentAsync(projectAssignmentId);
            return new ApiResponse(assignment, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(ProjectAssignmentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{projectAssignmentId:int}")]
        public async Task<ApiResponse> EditProjectAssignment(UpdateProjectAssignmentForm form, int projectAssignmentId)
        {
            var assignment = await _projectAssignmentService.EditProjectAssignmentAsync(projectAssignmentId, form);
            return new ApiResponse(assignment, StatusCodes.Status200OK);
        }
    }
}
