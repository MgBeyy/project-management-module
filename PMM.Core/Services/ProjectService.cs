using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.Common;
using PMM.Core.DTOs;
using PMM.Core.Exceptions;
using PMM.Core.Forms;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Data.Entities;
using PMM.Data.Enums;
using PMM.Data.Repositories;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public interface IProjectService
    {
        Task<ProjectDto> AddProjectAsync(CreateProjectForm form);
        Task<ProjectDto> GetProjectAsync(int projectId);
        Task<ProjectDto> EditProjectAsync(int projectId, UpdateProjectForm form);
        Task<PagedResult<ProjectDto>> Query(QueryProjectForm form);
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
            : base(principal, logger, userRepository)
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

            var existing = await _projectRepository.GetByCodeAsync(form.Code);
            if (existing is not null)
                throw new BusinessException("Bu kod ile kayıtlı bir proje bulunmaktadır.");

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
                if (form.PlannedStartDate != null && form.PlannedStartDate < DateTime.UtcNow.Date)
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
                throw new ArgumentNullException($"{typeof(UpdateProjectForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            var project = await _projectRepository.GetByIdAsync(projectId) ?? throw new NotFoundException("Proje Bulunamadı!");


            if (form.PlannedDeadline is not null && form.PlannedStartDate is not null)
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

        public async Task<PagedResult<ProjectDto>> Query(QueryProjectForm form)
        {
            IQueryable<Project> query = Enumerable.Empty<Project>().AsQueryable();
            query = _projectRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(p =>
                    p.Title.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    p.Code.ToLower().Contains(form.Search.Trim().ToLower()));
            }

            if (form.Id.HasValue)
                query = query.Where(e => e.Id == form.Id.Value);

            if (!string.IsNullOrWhiteSpace(form.Code))
                query = query.Where(e => e.Code.ToLower().Contains(form.Code.Trim().ToLower()));

            if (!string.IsNullOrWhiteSpace(form.Title))
                query = query.Where(e => e.Title.ToLower().Contains(form.Title.Trim().ToLower()));

            if (form.PlannedStartDate.HasValue)
                query = query.Where(e => e.PlannedStartDate == form.PlannedStartDate);
            if (form.PlannedStartDateMin.HasValue)
                query = query.Where(e => e.PlannedStartDate >= form.PlannedStartDateMin);
            if (form.PlannedStartDateMax.HasValue)
                query = query.Where(e => e.PlannedStartDate <= form.PlannedStartDateMax);

            if (form.PlannedDeadline.HasValue)
                query = query.Where(e => e.PlannedDeadline == form.PlannedDeadline);
            if (form.PlannedDeadlineMin.HasValue)
                query = query.Where(e => e.PlannedDeadline >= form.PlannedDeadlineMin);
            if (form.PlannedDeadlineMax.HasValue)
                query = query.Where(e => e.PlannedDeadline <= form.PlannedDeadlineMax);

            if (form.PlannedHours.HasValue)
                query = query.Where(e => e.PlannedHours == form.PlannedHours);
            if (form.PlannedHoursMin.HasValue)
                query = query.Where(e => e.PlannedHours >= form.PlannedHoursMin);
            if (form.PlannedHoursMax.HasValue)
                query = query.Where(e => e.PlannedHours <= form.PlannedHoursMax);

            if (form.StartedAt.HasValue)
                query = query.Where(e => e.StartedAt == form.StartedAt);

            if (form.EndAt.HasValue)
                query = query.Where(e => e.EndAt == form.EndAt);

            if (form.Status.HasValue)
                query = query.Where(e => e.Status == form.Status);

            if (form.Priority.HasValue)
                query = query.Where(e => e.Priority == form.Priority);

            if (form.ParentProjectId.HasValue)
                query = query.Where(e => e.ParentProjectId == form.ParentProjectId);

            if (form.ClientId.HasValue)
                query = query.Where(e => e.ClientId == form.ClientId);

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;

            int totalRecords = await query.CountAsync();

            var projects = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<ProjectDto>
            {
                Data = ProjectMapper.Map(projects),
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
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
            detailedProjectDto.CreatedByUser = createdBy != null ? IdNameMapper.Map(createdBy.Id, createdBy.Name) : null;

            if (project.UpdatedById.HasValue)
            {
                var updatedBy = await _userRepository.GetByIdAsync(project.UpdatedById);
                detailedProjectDto.UpdatedByUser = updatedBy != null ? IdNameMapper.Map(updatedBy.Id, updatedBy.Name) : null;
            }
            return detailedProjectDto;
        }
    }
}
