using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.Common;
using PMM.Core.Exceptions;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public class LabelService : _BaseService, ILabelService
    {
        private readonly ILabelRepository _labelRepository;
        private readonly ILogger<LabelService> _logger;

        public LabelService(
            ILabelRepository labelRepository,
            ILogger<LabelService> logger,
            IUserRepository userRepository,
            IPrincipal principal)
            : base(principal, logger, userRepository)
        {
            _labelRepository = labelRepository;
            _logger = logger;
        }

        public async Task<LabelDto> AddLabelAsync(CreateLabelForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateLabelForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            var label = LabelMapper.Map(form);
            _labelRepository.Create(label);
            await _labelRepository.SaveChangesAsync();

            return LabelMapper.Map(label);
        }

        public async Task<LabelDto> EditLabelAsync(int labelId, UpdateLabelForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(UpdateLabelForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            var label = await _labelRepository.GetByIdAsync(labelId);
            if (label == null)
                throw new NotFoundException("Etiket Bulunamadý!");

            label = LabelMapper.Map(form, label);
            _labelRepository.Update(label);
            await _labelRepository.SaveChangesAsync();

            return LabelMapper.Map(label);
        }

        public async Task DeleteLabelAsync(int labelId)
        {
            var label = await _labelRepository.GetByIdAsync(labelId);
            if (label == null)
                throw new NotFoundException("Etiket Bulunamadý!");

            _labelRepository.Delete(label);
            await _labelRepository.SaveChangesAsync();
        }

        public async Task<LabelDto> GetLabelAsync(int labelId)
        {
            var label = await _labelRepository.GetByIdAsync(labelId);
            if (label == null)
                throw new NotFoundException("Etiket Bulunamadý!");

            return LabelMapper.Map(label);
        }

        public async Task<PagedResult<LabelDto>> Query(QueryLabelForm form)
        {
            var query = _labelRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(l =>
                    l.Name.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    (l.Description != null && l.Description.ToLower().Contains(form.Search.Trim().ToLower())));
            }

            if (form.Id.HasValue)
                query = query.Where(l => l.Id == form.Id.Value);

            if (!string.IsNullOrWhiteSpace(form.Name))
                query = query.Where(l => l.Name.ToLower().Contains(form.Name.Trim().ToLower()));

            if (!string.IsNullOrWhiteSpace(form.Color))
                query = query.Where(l => l.Color != null && l.Color.ToLower().Contains(form.Color.Trim().ToLower()));

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;

            int totalRecords = await query.CountAsync();

            var labels = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<LabelDto>
            {
                Data = LabelMapper.Map(labels),
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
