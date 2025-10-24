using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMM.Data.Migrations
{
    /// <inheritdoc />
    public partial class ChangingUniqueRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TaskLabels_TaskId_LabelId",
                table: "TaskLabels");

            migrationBuilder.DropIndex(
                name: "IX_TaskDependencies_BlockingTaskId_BlockedTaskId",
                table: "TaskDependencies");

            migrationBuilder.DropIndex(
                name: "IX_TaskAssignments_UserId_TaskId_Unique",
                table: "TaskAssignments");

            migrationBuilder.DropIndex(
                name: "IX_ProjectRelations_ParentProjectId_ChildProjectId",
                table: "ProjectRelations");

            migrationBuilder.DropIndex(
                name: "IX_ProjectLabels_ProjectId_LabelId",
                table: "ProjectLabels");

            migrationBuilder.DropIndex(
                name: "IX_ProjectAssignments_UserId_ProjectId_Unique",
                table: "ProjectAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_TaskLabels_TaskId_LabelId",
                table: "TaskLabels",
                columns: new[] { "TaskId", "LabelId" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_TaskDependencies_BlockingTaskId_BlockedTaskId",
                table: "TaskDependencies",
                columns: new[] { "BlockingTaskId", "BlockedTaskId" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignments_UserId_TaskId_Unique",
                table: "TaskAssignments",
                columns: new[] { "UserId", "TaskId" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRelations_ParentProjectId_ChildProjectId",
                table: "ProjectRelations",
                columns: new[] { "ParentProjectId", "ChildProjectId" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectLabels_ProjectId_LabelId",
                table: "ProjectLabels",
                columns: new[] { "ProjectId", "LabelId" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAssignments_UserId_ProjectId_Unique",
                table: "ProjectAssignments",
                columns: new[] { "UserId", "ProjectId" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TaskLabels_TaskId_LabelId",
                table: "TaskLabels");

            migrationBuilder.DropIndex(
                name: "IX_TaskDependencies_BlockingTaskId_BlockedTaskId",
                table: "TaskDependencies");

            migrationBuilder.DropIndex(
                name: "IX_TaskAssignments_UserId_TaskId_Unique",
                table: "TaskAssignments");

            migrationBuilder.DropIndex(
                name: "IX_ProjectRelations_ParentProjectId_ChildProjectId",
                table: "ProjectRelations");

            migrationBuilder.DropIndex(
                name: "IX_ProjectLabels_ProjectId_LabelId",
                table: "ProjectLabels");

            migrationBuilder.DropIndex(
                name: "IX_ProjectAssignments_UserId_ProjectId_Unique",
                table: "ProjectAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_TaskLabels_TaskId_LabelId",
                table: "TaskLabels",
                columns: new[] { "TaskId", "LabelId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TaskDependencies_BlockingTaskId_BlockedTaskId",
                table: "TaskDependencies",
                columns: new[] { "BlockingTaskId", "BlockedTaskId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignments_UserId_TaskId_Unique",
                table: "TaskAssignments",
                columns: new[] { "UserId", "TaskId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRelations_ParentProjectId_ChildProjectId",
                table: "ProjectRelations",
                columns: new[] { "ParentProjectId", "ChildProjectId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectLabels_ProjectId_LabelId",
                table: "ProjectLabels",
                columns: new[] { "ProjectId", "LabelId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAssignments_UserId_ProjectId_Unique",
                table: "ProjectAssignments",
                columns: new[] { "UserId", "ProjectId" },
                unique: true);
        }
    }
}
