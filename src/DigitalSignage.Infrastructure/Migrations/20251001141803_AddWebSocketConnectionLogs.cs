using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWebSocketConnectionLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeviceApprovals_DeviceRegistrationRequests_DeviceRegistrat~1",
                table: "DeviceApprovals");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrationAuditLogs_DeviceRegistrationRequests_DeviceReg~1",
                table: "RegistrationAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_RegistrationAuditLogs_DeviceRegistrationRequestId1",
                table: "RegistrationAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_DeviceApprovals_DeviceRegistrationRequestId",
                table: "DeviceApprovals");

            migrationBuilder.DropIndex(
                name: "IX_DeviceApprovals_DeviceRegistrationRequestId1",
                table: "DeviceApprovals");

            migrationBuilder.DropColumn(
                name: "DeviceRegistrationRequestId1",
                table: "RegistrationAuditLogs");

            migrationBuilder.DropColumn(
                name: "DeviceRegistrationRequestId1",
                table: "DeviceApprovals");

            migrationBuilder.CreateTable(
                name: "WebSocketConnectionLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConnectionId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    ConnectedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DisconnectedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    DisconnectionReason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebSocketConnectionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WebSocketConnectionLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_DeviceRegistrationRequestId",
                table: "DeviceApprovals",
                column: "DeviceRegistrationRequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_ConnectedAt",
                table: "WebSocketConnectionLogs",
                column: "ConnectedAt");

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_ConnectionId",
                table: "WebSocketConnectionLogs",
                column: "ConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_UserId_DisconnectedAt",
                table: "WebSocketConnectionLogs",
                columns: new[] { "UserId", "DisconnectedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WebSocketConnectionLogs");

            migrationBuilder.DropIndex(
                name: "IX_DeviceApprovals_DeviceRegistrationRequestId",
                table: "DeviceApprovals");

            migrationBuilder.AddColumn<int>(
                name: "DeviceRegistrationRequestId1",
                table: "RegistrationAuditLogs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeviceRegistrationRequestId1",
                table: "DeviceApprovals",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_DeviceRegistrationRequestId1",
                table: "RegistrationAuditLogs",
                column: "DeviceRegistrationRequestId1");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_DeviceRegistrationRequestId",
                table: "DeviceApprovals",
                column: "DeviceRegistrationRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_DeviceRegistrationRequestId1",
                table: "DeviceApprovals",
                column: "DeviceRegistrationRequestId1",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DeviceApprovals_DeviceRegistrationRequests_DeviceRegistrat~1",
                table: "DeviceApprovals",
                column: "DeviceRegistrationRequestId1",
                principalTable: "DeviceRegistrationRequests",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrationAuditLogs_DeviceRegistrationRequests_DeviceReg~1",
                table: "RegistrationAuditLogs",
                column: "DeviceRegistrationRequestId1",
                principalTable: "DeviceRegistrationRequests",
                principalColumn: "Id");
        }
    }
}
