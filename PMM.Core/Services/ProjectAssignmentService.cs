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
    public interface IProjectAssignmentService
    {
        Task<ProjectAssignmentDto> AddProjectAssignmentAsync(CreateProjectAssignmentForm form);
        Task<ProjectAssignmentDto> GetProjectAssignmentAsync(int projectAssignmentId);
        Task<ProjectAssignmentDto> EditProjectAssignmentAsync(int projectAssignmentId, UpdateProjectAssignmentForm form);
        Task<List<ProjectAssignmentDto>> GetAllProjectAssignments();
    }
    public class ProjectAssignmentService : _BaseService, IProjectAssignmentService
    {
        private readonly ILogger<ProjectAssignmentService> _logger;
        private readonly IProjectAssignmentRepository _projectAssignmentRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IUserRepository _userRepository;
        public ProjectAssignmentService(IPrincipal principal, ILogger<ProjectAssignmentService> logger,
            IProjectAssignmentRepository projectAssignmentRepository,
            IProjectRepository projectRepository,
            IUserRepository userRepository
            ) : base(principal, logger, userRepository)
        {
            _logger = logger;
            _projectAssignmentRepository = projectAssignmentRepository;
            _projectRepository = projectRepository;
            _userRepository = userRepository;
        }

        public async Task<ProjectAssignmentDto> AddProjectAssignmentAsync(CreateProjectAssignmentForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateProjectAssignmentForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            _ = await _projectRepository.GetByIdAsync(form.ProjectId) ?? throw new NotFoundException("Proje Bulunamadı!");
            _ = await _userRepository.GetByIdAsync(form.UserId) ?? throw new NotFoundException("User Bulunamadı!");

            if (form.EndAt is not null && form.StartedAt is not null)
            {
                if (form.EndAt < form.StartedAt)
                    throw new BusinessException("Projeden ayrılma tarihi başlama tarihinden önce olamaz.");
            }

            var pa = ProjectAssignmentMapper.Map(form);
            pa.CreatedAt = DateTime.UtcNow;
            pa.CreatedById = LoggedInUser.Id;
            _projectAssignmentRepository.Create(pa);
            await _projectAssignmentRepository.SaveChangesAsync();
            return ProjectAssignmentMapper.Map(pa);
        }

        public async Task<ProjectAssignmentDto> EditProjectAssignmentAsync(int projectAssignmentId, UpdateProjectAssignmentForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(UpdateProjectAssignmentForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            var projectAssignment = await _projectAssignmentRepository.GetByIdAsync(projectAssignmentId) ?? throw new NotFoundException("Proje Ataması Bulunamadı!!");

            if (form.EndAt is not null && form.StartedAt is not null)
            {
                if (form.EndAt < form.StartedAt)
                    throw new BusinessException("Projeden ayrılma tarihi başlama tarihinden önce olamaz.");
            }

            projectAssignment = ProjectAssignmentMapper.Map(form, projectAssignment);
            projectAssignment.UpdatedAt = DateTime.UtcNow;
            projectAssignment.UpdatedById = LoggedInUser.Id;
            _projectAssignmentRepository.Update(projectAssignment);
            await _projectAssignmentRepository.SaveChangesAsync();
            return ProjectAssignmentMapper.Map(projectAssignment);
        }

        public async Task<List<ProjectAssignmentDto>> GetAllProjectAssignments()
        {
            var projects = _projectAssignmentRepository.QueryAll();
            return ProjectAssignmentMapper.Map(await projects.ToListAsync());
        }

        public async Task<ProjectAssignmentDto> GetProjectAssignmentAsync(int projectAssignmentId)
        {
            var pa = await _projectAssignmentRepository.GetByIdAsync(projectAssignmentId);
            if (pa == null)
                throw new NotFoundException("Proje Ataması Bulunamadı!");
            return ProjectAssignmentMapper.Map(pa);
        }
    }
}
