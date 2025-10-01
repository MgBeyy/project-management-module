using Microsoft.Extensions.Logging;
using PMM.Core.DTOs;
using PMM.Core.Exceptions;
using PMM.Core.Forms;
using PMM.Core.Helpers;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Data.Enums;
using PMM.Data.Repositories;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public interface IProjectService
    {
        Task<ProjectDto> AddProjectAsync(CreateProjectForm form);
        Task<ProjectDto> GetProjectAsync(int projectId);
        Task<ProjectDto> EditProjectAsync(int projectId, CreateProjectForm form);
        Task DeleteProjectAsync(int projectId);
        Task<List<ProjectDto>> GetAllProjects();
    }
    public class ProjectService : _BaseService, IProjectService
    {
        private readonly ILogger<ProjectService> _logger;
        private readonly IProjectRepository _projectRepository;
        private readonly IClientRepository _clientRepository;
        public ProjectService(IProjectRepository projectRepository,
            IClientRepository clientRepository,
            ILogger<ProjectService> logger,
            IPrincipal principal)
            : base(principal, logger)
        {
            _logger = logger;
            _projectRepository = projectRepository;
            _clientRepository = clientRepository;
        }

        public async Task<ProjectDto> AddProjectAsync(CreateProjectForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateProjectForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            if (form.PlannedDeadline is not null)
            {
                if (form.PlannedDeadline < form.PlannedStartDate)
                    throw new BusinessException("Planlanan bitirme tarihi başlama tarihinden önce olamaz.");
                var hours = WorkHoursCalculator.CalculateWorkingHours((DateTime)form.PlannedStartDate, (DateTime)form.PlannedDeadline);
            }

            if (form.Status is null)
            {
                if (form.PlannedStartDate < DateTime.UtcNow.Date)
                {
                    form.Status = EProjectStatus.Active;
                }
                else
                {
                    form.Status = EProjectStatus.Planned;
                }
            }

            if (form.ParentProjectId is not null)
            {
                var parentProject = _projectRepository.GetByIdAsync(form.ParentProjectId);
                if (parentProject is null)
                    throw new NotFoundException("Parent Proje Bulunamadı!");
            }
            if (form.ClientId is not null)
            {
                var client = _clientRepository.GetByIdAsync(form.ClientId) ?? throw new NotFoundException("Müşteri Bulunamadı!");
            }

            var project = ProjectMapper.Map(form);
            project.CreatedAt = DateTime.UtcNow;
            project.CreatedById = LoggedInUser.Id;
            _projectRepository.Create(project);
            await _projectRepository.SaveChangesAsync();
            return ProjectMapper.Map(project);
        }

        public async Task DeleteProjectAsync(int projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");
            _projectRepository.Delete(project);
            await _projectRepository.SaveChangesAsync();
        }

        public async Task<ProjectDto> EditProjectAsync(int projectId, CreateProjectForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateProjectForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");

            var new_project = ProjectMapper.Map(form);
            _projectRepository.Update(new_project);
            await _projectRepository.SaveChangesAsync();
            return ProjectMapper.Map(project);
        }

        public async Task<List<ProjectDto>> GetAllProjects()
        {
            var projects = _projectRepository.QueryAll();
            return ProjectMapper.Map(projects.ToList());
        }

        public async Task<ProjectDto> GetProjectAsync(int projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");
            return ProjectMapper.Map(project);
        }
    }
}
