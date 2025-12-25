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
    public class MachineService : _BaseService, IMachineService
    {
        private readonly ILogger<MachineService> _logger;
        private readonly IMachineRepository _machineRepository;

        public MachineService(IMachineRepository machineRepository,
            ILogger<MachineService> logger,
            IPrincipal principal,
            IUserRepository userRepository)
            : base(principal, logger, userRepository)
        {
            _logger = logger;
            _machineRepository = machineRepository;
        }

        public async Task<MachineDto> AddMachineAsync(CreateMachineForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateMachineForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            form.Name = form.Name?.Trim();
            form.Category = form.Category?.Trim();
            form.Brand = form.Brand?.Trim();
            form.Model = form.Model?.Trim();
            form.Currency = form.Currency?.Trim();

            var machine = MachineMapper.Map(form);

            _machineRepository.Create(machine);
            await _machineRepository.SaveChangesAsync();

            return MachineMapper.Map(machine);
        }

        public async Task<MachineDto> GetMachineAsync(int machineId)
        {
            var machine = await _machineRepository.GetByIdAsync(machineId);
            if (machine == null)
                throw new NotFoundException("Makine Bulunamadý!");

            return MachineMapper.Map(machine);
        }

        public async Task<MachineDto> EditMachineAsync(int machineId, UpdateMachineForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(UpdateMachineForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            form.Name = form.Name?.Trim();
            form.Category = form.Category?.Trim();
            form.Brand = form.Brand?.Trim();
            form.Model = form.Model?.Trim();
            form.Currency = form.Currency?.Trim();

            var machine = await _machineRepository.GetByIdAsync(machineId) ?? throw new NotFoundException("Makine Bulunamadý!");

            machine = MachineMapper.Map(form, machine);

            _machineRepository.Update(machine);
            await _machineRepository.SaveChangesAsync();

            return MachineMapper.Map(machine);
        }

        public async Task<PagedResult<MachineDto>> Query(QueryMachineForm form)
        {
            IQueryable<Machine> query = _machineRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(m =>
                    m.Name.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    m.Category.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    m.Brand.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    m.Model.ToLower().Contains(form.Search.Trim().ToLower()));
            }

            if (form.Id.HasValue)
                query = query.Where(e => e.Id == form.Id.Value);

            if (!string.IsNullOrWhiteSpace(form.Name))
                query = query.Where(e => e.Name.ToLower().Contains(form.Name.Trim().ToLower()));

            if (!string.IsNullOrWhiteSpace(form.Category))
                query = query.Where(e => e.Category.ToLower().Contains(form.Category.Trim().ToLower()));

            if (!string.IsNullOrWhiteSpace(form.Brand))
                query = query.Where(e => e.Brand.ToLower().Contains(form.Brand.Trim().ToLower()));

            if (!string.IsNullOrWhiteSpace(form.Model))
                query = query.Where(e => e.Model.ToLower().Contains(form.Model.Trim().ToLower()));

            if (form.HourlyCost.HasValue)
                query = query.Where(e => e.HourlyCost == form.HourlyCost);
            if (form.HourlyCostMin.HasValue)
                query = query.Where(e => e.HourlyCost >= form.HourlyCostMin);
            if (form.HourlyCostMax.HasValue)
                query = query.Where(e => e.HourlyCost <= form.HourlyCostMax);

            if (!string.IsNullOrWhiteSpace(form.Currency))
                query = query.Where(e => e.Currency.ToLower().Contains(form.Currency.Trim().ToLower()));

            if (form.PurchasePrice.HasValue)
                query = query.Where(e => e.PurchasePrice == form.PurchasePrice);
            if (form.PurchasePriceMin.HasValue)
                query = query.Where(e => e.PurchasePrice >= form.PurchasePriceMin);
            if (form.PurchasePriceMax.HasValue)
                query = query.Where(e => e.PurchasePrice <= form.PurchasePriceMax);

            if (form.PurchaseDate.HasValue)
                query = query.Where(e => e.PurchaseDate == form.PurchaseDate);
            if (form.PurchaseDateMin.HasValue)
                query = query.Where(e => e.PurchaseDate >= form.PurchaseDateMin);
            if (form.PurchaseDateMax.HasValue)
                query = query.Where(e => e.PurchaseDate <= form.PurchaseDateMax);

            if (form.IsActive.HasValue)
                query = query.Where(e => e.IsActive == form.IsActive.Value);

            if (form.Status.HasValue)
                query = query.Where(e => e.Status == form.Status.Value);

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;

            int totalRecords = await query.CountAsync();

            var machines = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<MachineDto>
            {
                Data = MachineMapper.Map(machines),
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task DeleteMachineAsync(int machineId)
        {
            var machine = await _machineRepository.GetByIdAsync(machineId);
            if (machine == null)
                throw new NotFoundException("Makine Bulunamadý!");

            _machineRepository.Delete(machine);
            await _machineRepository.SaveChangesAsync();
        }
    }
}