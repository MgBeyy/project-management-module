using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers
{
    public class FileController : _BaseController
    {
        private readonly IFileService _fileService;
        private readonly IWebHostEnvironment _env;

        public FileController(ILogger<FileController> logger,
                              IFileService fileService,
                              IWebHostEnvironment env) : base(logger)
        {
            _fileService = fileService;
            _env = env;
        }

        [ProducesResponseType(typeof(FileDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost]
        public async Task<ApiResponse> Create([FromForm] CreateFileForm form)
        {
            var physicalSavePath = Path.Combine(_env.WebRootPath, "files");
            Console.WriteLine($"Physical Save Path: {physicalSavePath}");
            var file = await _fileService.AddFileAsync(form, physicalSavePath);
            return new ApiResponse(file, StatusCodes.Status201Created);
        }

        [ProducesResponseType(typeof(PagedResult<FileDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> Query([FromQuery] QueryFileForm? form)
        {
            form ??= new QueryFileForm();
            var files = await _fileService.Query(form);
            return new ApiResponse(files, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(FileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{fileId:int}")]
        public async Task<ApiResponse> GetById(int fileId)
        {
            var file = await _fileService.GetFileAsync(fileId);
            return new ApiResponse(file, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(FileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{fileId:int}")]
        public async Task<ApiResponse> Edit(int fileId, UpdateFileForm form)
        {
            var file = await _fileService.EditFileAsync(fileId, form);
            return new ApiResponse(file, StatusCodes.Status200OK);
        }

        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("{fileId:int}")]
        public async Task<ApiResponse> Delete(int fileId)
        {
            await _fileService.DeleteFileAsync(fileId, _env.WebRootPath);
            return new ApiResponse("File deleted successfully", StatusCodes.Status200OK);
        }

        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{fileId:int}/download")]
        public async Task<IActionResult> Download(int fileId)
        {
            var fileDto = await _fileService.GetFileAsync(fileId);

            var physicalPath = Path.Combine(_env.WebRootPath, fileDto.File.TrimStart('/'));

            if (!System.IO.File.Exists(physicalPath))
            {
                return NotFound(new { message = "Dosya fiziksel olarak bulunamadý!" });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
            var fileName = Path.GetFileName(physicalPath);
            var contentType = GetContentType(fileName);

            return File(fileBytes, contentType, fileName);
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".txt" => "text/plain",
                ".zip" => "application/zip",
                ".rar" => "application/x-rar-compressed",
                _ => "application/octet-stream"
            };
        }
    }
}
