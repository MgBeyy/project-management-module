using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Core.Mappers
{
    public class MachineMapper
    {
        public static Machine Map(CreateMachineForm form)
        {
            return new Machine
            {
                Name = form.Name,
                Category = form.Category,
                Brand = form.Brand,
                Model = form.Model,
                HourlyCost = form.HourlyCost,
                Currency = form.Currency,
                PurchasePrice = form.PurchasePrice,
                PurchaseDate = form.PurchaseDate,
                UsefulLife = form.UsefulLife,
                IsActive = form.IsActive,
                Status = form.Status,
            };
        }

        public static MachineDto Map(Machine machine)
        {
            return new MachineDto
            {
                Id = machine.Id,
                Name = machine.Name,
                Category = machine.Category,
                Brand = machine.Brand,
                Model = machine.Model,
                HourlyCost = machine.HourlyCost,
                Currency = machine.Currency,
                PurchasePrice = machine.PurchasePrice,
                PurchaseDate = machine.PurchaseDate,
                UsefulLife = machine.UsefulLife,
                IsActive = machine.IsActive,
                Status = machine.Status,
                CreatedAt = machine.CreatedAt,
                CreatedById = machine.CreatedById,
                UpdatedAt = machine.UpdatedAt,
                UpdatedById = machine.UpdatedById,
            };
        }

        public static List<MachineDto> Map(List<Machine> machines)
        {
            return machines.Select(m => Map(m)).ToList();
        }

        public static Machine Map(UpdateMachineForm form, Machine machine)
        {
            machine.Name = form.Name;
            machine.Category = form.Category;
            machine.Brand = form.Brand;
            machine.Model = form.Model;
            machine.HourlyCost = form.HourlyCost;
            machine.Currency = form.Currency;
            machine.PurchasePrice = form.PurchasePrice;
            machine.PurchaseDate = form.PurchaseDate;
            machine.UsefulLife = form.UsefulLife;
            machine.IsActive = form.IsActive;
            machine.Status = form.Status;
            return machine;
        }
    }
}