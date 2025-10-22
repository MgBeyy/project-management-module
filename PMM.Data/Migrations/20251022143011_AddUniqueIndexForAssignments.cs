using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMM.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIndexForAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TaskAssignments_UserId",
                table: "TaskAssignments");

            migrationBuilder.DropIndex(
                name: "IX_ProjectAssignments_UserId",
                table: "ProjectAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignments_UserId_TaskId_Unique",
                table: "TaskAssignments",
                columns: new[] { "UserId", "TaskId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAssignments_UserId_ProjectId_Unique",
                table: "ProjectAssignments",
                columns: new[] { "UserId", "ProjectId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TaskAssignments_UserId_TaskId_Unique",
                table: "TaskAssignments");

            migrationBuilder.DropIndex(
                name: "IX_ProjectAssignments_UserId_ProjectId_Unique",
                table: "ProjectAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignments_UserId",
                table: "TaskAssignments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAssignments_UserId",
                table: "ProjectAssignments",
                column: "UserId");
        }
    }
}
