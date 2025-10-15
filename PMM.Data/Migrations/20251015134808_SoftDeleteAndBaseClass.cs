using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMM.Data.Migrations
{
    /// <inheritdoc />
    public partial class SoftDeleteAndBaseClass : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAssignments_Users_CreatedById",
                table: "ProjectAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAssignments_Users_UpdatedById",
                table: "ProjectAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_CreatedById",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_UpdatedById",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskAssignments_Users_CreatedById",
                table: "TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskAssignments_Users_UpdatedById",
                table: "TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_CreatedById",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_UpdatedById",
                table: "Tasks");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Tasks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "TaskLabels",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "TaskLabels",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "TaskLabels",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "TaskDependencies",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "TaskDependencies",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "TaskDependencies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "TaskAssignments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "TaskAssignments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "TaskAssignments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "PlannedStartDate",
                table: "Projects",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Projects",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Projects",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "Projects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ProjectRelations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "ProjectRelations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ProjectRelations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ProjectLabels",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "ProjectLabels",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ProjectLabels",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ProjectAssignments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "ProjectAssignments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ProjectAssignments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Labels",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "Labels",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Labels",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Files",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "Files",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Files",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Clients",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Clients",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Clients",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "Clients",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Clients",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Clients",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Clients",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Activities",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedById",
                table: "Activities",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Activities",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedById",
                table: "Users",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Users_DeletedById",
                table: "Users",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UpdatedById",
                table: "Users",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_DeletedById",
                table: "Tasks",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_TaskLabels_DeletedById",
                table: "TaskLabels",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_TaskDependencies_DeletedById",
                table: "TaskDependencies",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignments_DeletedById",
                table: "TaskAssignments",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_DeletedById",
                table: "Projects",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRelations_DeletedById",
                table: "ProjectRelations",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectLabels_DeletedById",
                table: "ProjectLabels",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAssignments_DeletedById",
                table: "ProjectAssignments",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_DeletedById",
                table: "Labels",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Files_DeletedById",
                table: "Files",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_CreatedById",
                table: "Clients",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_DeletedById",
                table: "Clients",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_UpdatedById",
                table: "Clients",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_DeletedById",
                table: "Activities",
                column: "DeletedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Users_DeletedById",
                table: "Activities",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Users_CreatedById",
                table: "Clients",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Users_DeletedById",
                table: "Clients",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Users_UpdatedById",
                table: "Clients",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Files_Users_DeletedById",
                table: "Files",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Labels_Users_DeletedById",
                table: "Labels",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAssignments_Users_CreatedById",
                table: "ProjectAssignments",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAssignments_Users_DeletedById",
                table: "ProjectAssignments",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAssignments_Users_UpdatedById",
                table: "ProjectAssignments",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectLabels_Users_DeletedById",
                table: "ProjectLabels",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectRelations_Users_DeletedById",
                table: "ProjectRelations",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_CreatedById",
                table: "Projects",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_DeletedById",
                table: "Projects",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_UpdatedById",
                table: "Projects",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAssignments_Users_CreatedById",
                table: "TaskAssignments",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAssignments_Users_DeletedById",
                table: "TaskAssignments",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAssignments_Users_UpdatedById",
                table: "TaskAssignments",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskDependencies_Users_DeletedById",
                table: "TaskDependencies",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskLabels_Users_DeletedById",
                table: "TaskLabels",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_CreatedById",
                table: "Tasks",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_DeletedById",
                table: "Tasks",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_UpdatedById",
                table: "Tasks",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_CreatedById",
                table: "Users",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_DeletedById",
                table: "Users",
                column: "DeletedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Users_UpdatedById",
                table: "Users",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Users_DeletedById",
                table: "Activities");

            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Users_CreatedById",
                table: "Clients");

            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Users_DeletedById",
                table: "Clients");

            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Users_UpdatedById",
                table: "Clients");

            migrationBuilder.DropForeignKey(
                name: "FK_Files_Users_DeletedById",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_Labels_Users_DeletedById",
                table: "Labels");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAssignments_Users_CreatedById",
                table: "ProjectAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAssignments_Users_DeletedById",
                table: "ProjectAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAssignments_Users_UpdatedById",
                table: "ProjectAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectLabels_Users_DeletedById",
                table: "ProjectLabels");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectRelations_Users_DeletedById",
                table: "ProjectRelations");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_CreatedById",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_DeletedById",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_UpdatedById",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskAssignments_Users_CreatedById",
                table: "TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskAssignments_Users_DeletedById",
                table: "TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskAssignments_Users_UpdatedById",
                table: "TaskAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskDependencies_Users_DeletedById",
                table: "TaskDependencies");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskLabels_Users_DeletedById",
                table: "TaskLabels");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_CreatedById",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_DeletedById",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_UpdatedById",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_CreatedById",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_DeletedById",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Users_UpdatedById",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_CreatedById",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_DeletedById",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_UpdatedById",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_DeletedById",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_TaskLabels_DeletedById",
                table: "TaskLabels");

            migrationBuilder.DropIndex(
                name: "IX_TaskDependencies_DeletedById",
                table: "TaskDependencies");

            migrationBuilder.DropIndex(
                name: "IX_TaskAssignments_DeletedById",
                table: "TaskAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Projects_DeletedById",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_ProjectRelations_DeletedById",
                table: "ProjectRelations");

            migrationBuilder.DropIndex(
                name: "IX_ProjectLabels_DeletedById",
                table: "ProjectLabels");

            migrationBuilder.DropIndex(
                name: "IX_ProjectAssignments_DeletedById",
                table: "ProjectAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Labels_DeletedById",
                table: "Labels");

            migrationBuilder.DropIndex(
                name: "IX_Files_DeletedById",
                table: "Files");

            migrationBuilder.DropIndex(
                name: "IX_Clients_CreatedById",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_DeletedById",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_UpdatedById",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Activities_DeletedById",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "TaskLabels");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "TaskLabels");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "TaskLabels");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "TaskDependencies");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "TaskDependencies");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "TaskDependencies");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "TaskAssignments");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "TaskAssignments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "TaskAssignments");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ProjectRelations");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "ProjectRelations");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ProjectRelations");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ProjectLabels");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "ProjectLabels");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ProjectLabels");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ProjectAssignments");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "ProjectAssignments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ProjectAssignments");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Labels");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "Labels");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Labels");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Activities");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "PlannedStartDate",
                table: "Projects",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1),
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Projects",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAssignments_Users_CreatedById",
                table: "ProjectAssignments",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAssignments_Users_UpdatedById",
                table: "ProjectAssignments",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_CreatedById",
                table: "Projects",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_UpdatedById",
                table: "Projects",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAssignments_Users_CreatedById",
                table: "TaskAssignments",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAssignments_Users_UpdatedById",
                table: "TaskAssignments",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_CreatedById",
                table: "Tasks",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_UpdatedById",
                table: "Tasks",
                column: "UpdatedById",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
