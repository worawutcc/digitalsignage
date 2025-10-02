using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DeviceRegistrationUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DeviceRegistrationRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MacAddress = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: false),
                    Pin = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    DeviceModel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Manufacturer = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AndroidVersion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AppVersion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    NetworkName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HardwareSpecs = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastPolledAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ApprovedDeviceId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceRegistrationRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceRegistrationRequests_Devices_ApprovedDeviceId",
                        column: x => x.ApprovedDeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DeviceApprovals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceRegistrationRequestId = table.Column<int>(type: "integer", nullable: false),
                    ApprovedByUserId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DeviceName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DeviceGroupId = table.Column<int>(type: "integer", nullable: true),
                    ZoneId = table.Column<int>(type: "integer", nullable: true),
                    InitialScheduleId = table.Column<int>(type: "integer", nullable: true),
                    Tags = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    DeviceKey = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    DeviceRegistrationRequestId1 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceApprovals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceApprovals_DeviceGroups_DeviceGroupId",
                        column: x => x.DeviceGroupId,
                        principalTable: "DeviceGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DeviceApprovals_DeviceRegistrationRequests_DeviceRegistrati~",
                        column: x => x.DeviceRegistrationRequestId,
                        principalTable: "DeviceRegistrationRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeviceApprovals_DeviceRegistrationRequests_DeviceRegistrat~1",
                        column: x => x.DeviceRegistrationRequestId1,
                        principalTable: "DeviceRegistrationRequests",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DeviceApprovals_Schedules_InitialScheduleId",
                        column: x => x.InitialScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DeviceApprovals_Users_ApprovedByUserId",
                        column: x => x.ApprovedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RegistrationAuditLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceRegistrationRequestId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Details = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Result = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    DeviceRegistrationRequestId1 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrationAuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrationAuditLogs_DeviceRegistrationRequests_DeviceRegi~",
                        column: x => x.DeviceRegistrationRequestId,
                        principalTable: "DeviceRegistrationRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RegistrationAuditLogs_DeviceRegistrationRequests_DeviceReg~1",
                        column: x => x.DeviceRegistrationRequestId1,
                        principalTable: "DeviceRegistrationRequests",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RegistrationAuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_ApprovedAt",
                table: "DeviceApprovals",
                column: "ApprovedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_ApprovedByUserId",
                table: "DeviceApprovals",
                column: "ApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_DeviceGroupId",
                table: "DeviceApprovals",
                column: "DeviceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_DeviceKey",
                table: "DeviceApprovals",
                column: "DeviceKey");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_DeviceRegistrationRequestId",
                table: "DeviceApprovals",
                column: "DeviceRegistrationRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_DeviceRegistrationRequestId1",
                table: "DeviceApprovals",
                column: "DeviceRegistrationRequestId1",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_InitialScheduleId",
                table: "DeviceApprovals",
                column: "InitialScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_Status",
                table: "DeviceApprovals",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_ApprovedDeviceId",
                table: "DeviceRegistrationRequests",
                column: "ApprovedDeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_CreatedAt",
                table: "DeviceRegistrationRequests",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_MacAddress",
                table: "DeviceRegistrationRequests",
                column: "MacAddress");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Pin",
                table: "DeviceRegistrationRequests",
                column: "Pin");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Status",
                table: "DeviceRegistrationRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_Action",
                table: "RegistrationAuditLogs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_CreatedAt",
                table: "RegistrationAuditLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_DeviceRegistrationRequestId",
                table: "RegistrationAuditLogs",
                column: "DeviceRegistrationRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_DeviceRegistrationRequestId1",
                table: "RegistrationAuditLogs",
                column: "DeviceRegistrationRequestId1");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_Result",
                table: "RegistrationAuditLogs",
                column: "Result");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_UserId",
                table: "RegistrationAuditLogs",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeviceApprovals");

            migrationBuilder.DropTable(
                name: "RegistrationAuditLogs");

            migrationBuilder.DropTable(
                name: "DeviceRegistrationRequests");
        }
    }
}
