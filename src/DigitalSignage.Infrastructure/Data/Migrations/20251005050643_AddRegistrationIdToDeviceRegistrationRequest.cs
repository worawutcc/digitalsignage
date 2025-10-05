using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRegistrationIdToDeviceRegistrationRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RegistrationId",
                table: "DeviceRegistrationRequests",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_RegistrationId",
                table: "DeviceRegistrationRequests",
                column: "RegistrationId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_RegistrationId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "RegistrationId",
                table: "DeviceRegistrationRequests");
        }
    }
}
