using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMM.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlannedAndActualHoursToTask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActualHours",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PlannedHours",
                table: "Tasks",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualHours",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "PlannedHours",
                table: "Tasks");
        }
    }
}
