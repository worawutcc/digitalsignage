using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEmailConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_CreatedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "DeviceRegistrationRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                comment: "Email address provided by device for automatic user creation",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Email",
                table: "DeviceRegistrationRequests",
                column: "Email");

            migrationBuilder.AddForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_CreatedUserId",
                table: "DeviceRegistrationRequests",
                column: "CreatedUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_CreatedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_Email",
                table: "DeviceRegistrationRequests");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "DeviceRegistrationRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldComment: "Email address provided by device for automatic user creation");

            migrationBuilder.AddForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_CreatedUserId",
                table: "DeviceRegistrationRequests",
                column: "CreatedUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
