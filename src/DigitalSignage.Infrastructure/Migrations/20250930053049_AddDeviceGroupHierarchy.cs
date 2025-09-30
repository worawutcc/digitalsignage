using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDeviceGroupHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DeviceGroups_Name",
                table: "DeviceGroups");

            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "DeviceGroups",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ParentGroupId",
                table: "DeviceGroups",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Path",
                table: "DeviceGroups",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_Name",
                table: "DeviceGroups",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_ParentGroupId",
                table: "DeviceGroups",
                column: "ParentGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_ParentGroupId_Name",
                table: "DeviceGroups",
                columns: new[] { "ParentGroupId", "Name" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DeviceGroups_DeviceGroups_ParentGroupId",
                table: "DeviceGroups",
                column: "ParentGroupId",
                principalTable: "DeviceGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeviceGroups_DeviceGroups_ParentGroupId",
                table: "DeviceGroups");

            migrationBuilder.DropIndex(
                name: "IX_DeviceGroups_Name",
                table: "DeviceGroups");

            migrationBuilder.DropIndex(
                name: "IX_DeviceGroups_ParentGroupId",
                table: "DeviceGroups");

            migrationBuilder.DropIndex(
                name: "IX_DeviceGroups_ParentGroupId_Name",
                table: "DeviceGroups");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "DeviceGroups");

            migrationBuilder.DropColumn(
                name: "ParentGroupId",
                table: "DeviceGroups");

            migrationBuilder.DropColumn(
                name: "Path",
                table: "DeviceGroups");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_Name",
                table: "DeviceGroups",
                column: "Name",
                unique: true);
        }
    }
}
