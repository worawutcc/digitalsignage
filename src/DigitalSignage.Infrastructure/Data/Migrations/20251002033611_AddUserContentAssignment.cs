using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserContentAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "Schedules",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                comment: "Marks this schedule as a fallback when user has no assigned schedules");

            migrationBuilder.AddColumn<int>(
                name: "AssignedUserId",
                table: "Devices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MatchedUserId",
                table: "DeviceRegistrationRequests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestedUserDisplayName",
                table: "DeviceRegistrationRequests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                comment: "Optional friendly name provided by device");

            migrationBuilder.AddColumn<string>(
                name: "RequestedUsername",
                table: "DeviceRegistrationRequests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                comment: "Email or username provided by device during registration");

            migrationBuilder.CreateTable(
                name: "UserSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                    AssignedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, comment: "When this schedule was assigned to the user (UTC)"),
                    AssignedByUserId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSchedules_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserSchedules_Users_AssignedByUserId",
                        column: x => x.AssignedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_UserSchedules_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_IsDefault",
                table: "Schedules",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_AssignedUserId",
                table: "Devices",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_MatchedUserId",
                table: "DeviceRegistrationRequests",
                column: "MatchedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_RequestedUsername",
                table: "DeviceRegistrationRequests",
                column: "RequestedUsername");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Status_CreatedAt",
                table: "DeviceRegistrationRequests",
                columns: new[] { "Status", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedule_CreatedAt",
                table: "UserSchedules",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedule_UpdatedAt",
                table: "UserSchedules",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_AssignedByUserId",
                table: "UserSchedules",
                column: "AssignedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_ScheduleId",
                table: "UserSchedules",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_UserId",
                table: "UserSchedules",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_UserId_ScheduleId",
                table: "UserSchedules",
                columns: new[] { "UserId", "ScheduleId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_MatchedUserId",
                table: "DeviceRegistrationRequests",
                column: "MatchedUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Devices_Users_AssignedUserId",
                table: "Devices",
                column: "AssignedUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeviceRegistrationRequests_Users_MatchedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Devices_Users_AssignedUserId",
                table: "Devices");

            migrationBuilder.DropTable(
                name: "UserSchedules");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_IsDefault",
                table: "Schedules");

            migrationBuilder.DropIndex(
                name: "IX_Devices_AssignedUserId",
                table: "Devices");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_MatchedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_RequestedUsername",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_Status_CreatedAt",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "AssignedUserId",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "MatchedUserId",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "RequestedUserDisplayName",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "RequestedUsername",
                table: "DeviceRegistrationRequests");
        }
    }
}
