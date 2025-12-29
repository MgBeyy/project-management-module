using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMM.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMachineIdToActivity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Machines_MachineId",
                table: "Activities");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Activities",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Machines_MachineId",
                table: "Activities",
                column: "MachineId",
                principalTable: "Machines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Machines_MachineId",
                table: "Activities");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Activities",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Machines_MachineId",
                table: "Activities",
                column: "MachineId",
                principalTable: "Machines",
                principalColumn: "Id");
        }
    }
}
