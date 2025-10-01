using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Core.Services;

namespace PMM.API.Controllers
{

    public class ProjectController : _BaseController
    {
        private readonly IProjectService _projectService;
        public ProjectController(
             ILogger<ProjectController> logger,
            IProjectService projectService)
            : base(logger)
        {
            _projectService = projectService;
        }
        [ProducesResponseType(typeof(List<ProjectDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<ApiResponse> CreateProject(CreateProjectForm form)
        {
            await _projectService.AddProjectAsync(form);
            return new ApiResponse("Project created successfully", StatusCodes.Status201Created);
        }
        [ProducesResponseType(typeof(List<ProjectDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> GetAll()
        {
            var projects = await _projectService.GetAllProjects();
            return new ApiResponse(projects, StatusCodes.Status200OK);
        }
        [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{projectId:int}")]
        public async Task<ApiResponse> GetProjectById(int projectId)
        {
            var project = await _projectService.GetProjectAsync(projectId);
            return new ApiResponse(project, StatusCodes.Status200OK);
        }
        [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{projectId:int}")]
        public async Task<ApiResponse> EditProject(CreateProjectForm form, int projectId)
        {
            var project = await _projectService.EditProjectAsync(projectId, form);
            return new ApiResponse(project, StatusCodes.Status200OK);
        }
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("{projectId:int}")]
        public async Task<ApiResponse> DeleteProjectAsync(int projectId)
        {
            await _projectService.DeleteProjectAsync(projectId);
            return new ApiResponse("Project deleted successfully", StatusCodes.Status200OK);
        }
    }
}
