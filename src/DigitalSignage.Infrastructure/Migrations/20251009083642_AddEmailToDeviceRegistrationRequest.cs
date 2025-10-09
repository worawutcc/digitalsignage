using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailToDeviceRegistrationRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_Device",
                table: "assignments");

            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_DeviceGroup",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_assignments_target_id",
                table: "assignments");

            migrationBuilder.AddColumn<int>(
                name: "CreatedUserId",
                table: "DeviceRegistrationRequests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "DeviceRegistrationRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DeviceGroupId",
                table: "assignments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeviceId",
                table: "assignments",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_CreatedUserId",
                table: "DeviceRegistrationRequests",
                column: "CreatedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_DeviceGroupId",
                table: "assignments",
                column: "DeviceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_DeviceId",
                table: "assignments",
                column: "DeviceId");

            migrationBuilder.AddForeignKey(
                name: "FK_assignments_DeviceGroups_DeviceGroupId",
                table: "assignments",
                column: "DeviceGroupId",
                principalTable: "DeviceGroups",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_assignments_Devices_DeviceId",
                table: "assignments",
                column: "DeviceId",
                principalTable: "Devices",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_CreatedUserId",
                table: "DeviceRegistrationRequests",
                column: "CreatedUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_assignments_DeviceGroups_DeviceGroupId",
                table: "assignments");

            migrationBuilder.DropForeignKey(
                name: "FK_assignments_Devices_DeviceId",
                table: "assignments");

            migrationBuilder.DropForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_CreatedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_CreatedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_assignments_DeviceGroupId",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_assignments_DeviceId",
                table: "assignments");

            migrationBuilder.DropColumn(
                name: "CreatedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "DeviceGroupId",
                table: "assignments");

            migrationBuilder.DropColumn(
                name: "DeviceId",
                table: "assignments");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_target_id",
                table: "assignments",
                column: "target_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_Device",
                table: "assignments",
                column: "target_id",
                principalTable: "Devices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_DeviceGroup",
                table: "assignments",
                column: "target_id",
                principalTable: "DeviceGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
