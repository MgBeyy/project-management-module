using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
{
    public interface IMachineService
    {
        Task<MachineDto> AddMachineAsync(CreateMachineForm form);
        Task<MachineDto> GetMachineAsync(int machineId);
        Task<MachineDto> EditMachineAsync(int machineId, UpdateMachineForm form);
        Task<PagedResult<MachineDto>> Query(QueryMachineForm form);
        Task DeleteMachineAsync(int machineId);
    }
}