using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.DTOs;
using PMM.Core.Exceptions;
using PMM.Core.Forms;
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
        Task<List<ProjectDto>> GetAllProjects();
        Task<DetailedProjectDto> GetDetailedProjectAsync(int projectId);
    }
    public class ProjectService : _BaseService, IProjectService
    {
        private readonly ILogger<ProjectService> _logger;
        private readonly IProjectRepository _projectRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IUserRepository _userRepository;
        public ProjectService(IProjectRepository projectRepository,
            IClientRepository clientRepository,
            ILogger<ProjectService> logger,
            IUserRepository userRepository,
            IPrincipal principal)
            : base(principal, logger)
        {
            _logger = logger;
            _projectRepository = projectRepository;
            _clientRepository = clientRepository;
            _userRepository = userRepository;
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
            }
            if (form.StartedAt is not null && form.EndAt is not null)
            {
                if (form.EndAt < form.StartedAt)
                    throw new BusinessException("Proje bitirme tarihi başlama tarihinden önce olamaz.");
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
                _ = await _projectRepository.GetByIdAsync(form.ParentProjectId) ?? throw new NotFoundException("Ebeveyn Proje Bulunamadı!");
            if (form.ClientId is not null)
                _ = await _clientRepository.GetByIdAsync(form.ClientId) ?? throw new NotFoundException("Müşteri Bulunamadı!");

            var project = ProjectMapper.Map(form);
            project.CreatedAt = DateTime.UtcNow;
            project.CreatedById = LoggedInUser.Id;
            _projectRepository.Create(project);
            await _projectRepository.SaveChangesAsync();
            return ProjectMapper.Map(project);
        }

        public async Task<ProjectDto> EditProjectAsync(int projectId, UpdateProjectForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateProjectForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            var project = await _projectRepository.GetByIdAsync(projectId) ?? throw new NotFoundException("Proje Bulunamadı!");


            if (form.PlannedDeadline is not null)
            {
                if (form.PlannedDeadline < form.PlannedStartDate)
                    throw new BusinessException("Planlanan bitirme tarihi başlama tarihinden önce olamaz.");
            }
            if (form.StartedAt is not null && form.EndAt is not null)
            {
                if (form.EndAt < form.StartedAt)
                    throw new BusinessException("Proje bitirme tarihi başlama tarihinden önce olamaz.");
            }

            if (form.ParentProjectId is not null)
                _ = await _projectRepository.GetByIdAsync(form.ParentProjectId) ?? throw new NotFoundException("Üst Proje Bulunamadı!");

            project = ProjectMapper.Map(form, project);
            project.UpdatedAt = DateTime.UtcNow;
            project.UpdatedById = LoggedInUser.Id;
            _projectRepository.Update(project);
            await _projectRepository.SaveChangesAsync();
            return ProjectMapper.Map(project);
        }

        public async Task<List<ProjectDto>> GetAllProjects()
        {
            var projects = _projectRepository.QueryAll();
            return ProjectMapper.Map(await projects.ToListAsync());
        }

        public async Task<ProjectDto> GetProjectAsync(int projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");
            return ProjectMapper.Map(project);
        }
        public async Task<DetailedProjectDto> GetDetailedProjectAsync(int projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");

            var detailedProjectDto = ProjectMapper.DetailedMap(project);

            detailedProjectDto.ParentProject = project.ParentProjectId.HasValue
                ? ProjectMapper.Map(await _projectRepository.GetByIdAsync(project.ParentProjectId.Value))
                : null;

            detailedProjectDto.Client = project.ClientId.HasValue
                ? ClientMapper.Map(await _clientRepository.GetByIdAsync(project.ClientId.Value))
                : null;

            var createdBy = await _userRepository.GetByIdAsync(project.CreatedById);
            detailedProjectDto.CreatedByUser = IdNameMapper.Map(createdBy.Id, createdBy.Name);

            if (project.UpdatedById.HasValue)
            {
                var updatedBy = await _userRepository.GetByIdAsync(project.UpdatedById);
                detailedProjectDto.UpdatedByUser = IdNameMapper.Map(updatedBy.Id, updatedBy.Name);
            }
            return detailedProjectDto;
        }
    }
}
