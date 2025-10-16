using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers
{
    public class LabelController : _BaseController
    {
        private readonly ILabelService _labelService;

        public LabelController(
            ILogger<LabelController> logger,
            ILabelService labelService)
            : base(logger)
        {
            _labelService = labelService;
        }

        [ProducesResponseType(typeof(LabelDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<ApiResponse> Create(CreateLabelForm form)
        {
            var label = await _labelService.AddLabelAsync(form);
            return new ApiResponse(label, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(PagedResult<LabelDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> Query([FromQuery] QueryLabelForm form)
        {
            var labels = await _labelService.Query(form);
            return new ApiResponse(labels, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(LabelDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{labelId:int}")]
        public async Task<ApiResponse> GetById(int labelId)
        {
            var label = await _labelService.GetLabelAsync(labelId);
            return new ApiResponse(label, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(LabelDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{labelId:int}")]
        public async Task<ApiResponse> Edit(int labelId, UpdateLabelForm form)
        {
            var label = await _labelService.EditLabelAsync(labelId, form);
            return new ApiResponse(label, StatusCodes.Status200OK);
        }

        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("{labelId:int}")]
        public async Task<ApiResponse> Delete(int labelId)
        {
            await _labelService.DeleteLabelAsync(labelId);
            return new ApiResponse("Label deleted successfully", StatusCodes.Status200OK);
        }
    }
}
