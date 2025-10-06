using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.Services;

namespace PMM.API.Controllers
{
    public class DummyDataController : _BaseController
    {
        private readonly IDummyDataService _dummyDataService;
        public DummyDataController(ILogger<DummyDataController> logger, IDummyDataService dummyDataService) : base(logger)
        {
            _dummyDataService = dummyDataService;
        }

        [HttpPost("seed")]
        public async Task<ApiResponse> Seed()
        {
            try
            {
                await _dummyDataService.SeedAllAsync();
                return new ApiResponse("Dummy data seeded successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return new ApiResponse($"Error: {ex.Message} - Inner: {ex.InnerException?.Message}", null, 500);
            }
        }
    }
}
