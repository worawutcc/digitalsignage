using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceRegistryEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    BaseUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    HealthCheckUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false, defaultValue: ""),
                    Tags = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Metadata = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RegisteredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastHeartbeat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastHealthCheck = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConsecutiveHealthCheckFailures = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceInstances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ServiceId = table.Column<int>(type: "integer", nullable: false),
                    InstanceId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EndpointUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    Port = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    InstanceMetadata = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RegisteredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastSeen = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeregisteredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    HealthCheckIntervalSeconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    HealthCheckTimeoutSeconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                    MaxConsecutiveFailures = table.Column<int>(type: "integer", nullable: false, defaultValue: 3)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceInstances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceInstances_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HealthCheckResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ServiceId = table.Column<int>(type: "integer", nullable: false),
                    ServiceInstanceId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CheckedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ResponseTimeMs = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ResponseMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    AdditionalData = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthCheckResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthCheckResults_ServiceInstances_ServiceInstanceId",
                        column: x => x.ServiceInstanceId,
                        principalTable: "ServiceInstances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HealthCheckResults_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResults_CheckedAt",
                table: "HealthCheckResults",
                column: "CheckedAt");

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResults_ServiceId_CheckedAt",
                table: "HealthCheckResults",
                columns: new[] { "ServiceId", "CheckedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResults_ServiceInstanceId_CheckedAt",
                table: "HealthCheckResults",
                columns: new[] { "ServiceInstanceId", "CheckedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResults_Status",
                table: "HealthCheckResults",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_EndpointUrl",
                table: "ServiceInstances",
                column: "EndpointUrl");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_IsActive",
                table: "ServiceInstances",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_LastSeen",
                table: "ServiceInstances",
                column: "LastSeen");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_RegisteredAt",
                table: "ServiceInstances",
                column: "RegisteredAt");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_ServiceId_InstanceId",
                table: "ServiceInstances",
                columns: new[] { "ServiceId", "InstanceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_Status",
                table: "ServiceInstances",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Services_IsActive",
                table: "Services",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Services_LastHeartbeat",
                table: "Services",
                column: "LastHeartbeat");

            migrationBuilder.CreateIndex(
                name: "IX_Services_Name",
                table: "Services",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Services_Name_Version",
                table: "Services",
                columns: new[] { "Name", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Services_RegisteredAt",
                table: "Services",
                column: "RegisteredAt");

            migrationBuilder.CreateIndex(
                name: "IX_Services_Status",
                table: "Services",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Services_Type",
                table: "Services",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HealthCheckResults");

            migrationBuilder.DropTable(
                name: "ServiceInstances");

            migrationBuilder.DropTable(
                name: "Services");
        }
    }
}
