using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers
{
    public class MachineController : _BaseController
    {
        private readonly IMachineService _machineService;
        public MachineController(
            ILogger<MachineController> logger,
            IMachineService machineService)
            : base(logger)
        {
            _machineService = machineService;
        }

        [ProducesResponseType(typeof(MachineDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<ApiResponse> CreateMachine(CreateMachineForm form)
        {
            var machine = await _machineService.AddMachineAsync(form);
            return new ApiResponse(machine, StatusCodes.Status201Created);
        }

        [ProducesResponseType(typeof(PagedResult<MachineDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> GetAll([FromQuery] QueryMachineForm? form)
        {
            form ??= new QueryMachineForm();
            var machines = await _machineService.Query(form);
            return new ApiResponse(machines, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(MachineDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{machineId:int}")]
        public async Task<ApiResponse> GetMachineById(int machineId)
        {
            var machine = await _machineService.GetMachineAsync(machineId);
            return new ApiResponse(machine, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(MachineDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{machineId:int}")]
        public async Task<ApiResponse> EditMachine(UpdateMachineForm form, int machineId)
        {
            var machine = await _machineService.EditMachineAsync(machineId, form);
            return new ApiResponse(machine, StatusCodes.Status200OK);
        }

        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("{machineId:int}")]
        public async Task<ApiResponse> DeleteMachine(int machineId)
        {
            await _machineService.DeleteMachineAsync(machineId);
            return new ApiResponse("Makine baþarýyla silindi.", StatusCodes.Status200OK);
        }
    }
}