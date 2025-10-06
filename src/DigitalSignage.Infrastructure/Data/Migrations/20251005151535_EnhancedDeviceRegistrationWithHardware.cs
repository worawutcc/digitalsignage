using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class EnhancedDeviceRegistrationWithHardware : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HardwareInfo",
                table: "DeviceRegistrationRequests",
                type: "jsonb",
                maxLength: 2000,
                nullable: true,
                comment: "Enhanced hardware information JSON payload from device");

            migrationBuilder.AddColumn<bool>(
                name: "HardwareProcessed",
                table: "DeviceRegistrationRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                comment: "Flag indicating whether hardware information has been processed");

            migrationBuilder.AddColumn<DateTime>(
                name: "HardwareProcessedAt",
                table: "DeviceRegistrationRequests",
                type: "timestamp without time zone",
                nullable: true,
                comment: "Timestamp when hardware information was processed");

            migrationBuilder.AddColumn<bool>(
                name: "HasHardwareInfo",
                table: "DeviceRegistrationRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                comment: "Flag indicating whether enhanced hardware information was provided");

            migrationBuilder.CreateTable(
                name: "DeviceHardwareProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    DisplayWidth = table.Column<int>(type: "integer", nullable: false),
                    DisplayHeight = table.Column<int>(type: "integer", nullable: false),
                    RefreshRate = table.Column<float>(type: "real", precision: 5, scale: 2, nullable: false),
                    PhysicalWidth = table.Column<float>(type: "real", precision: 6, scale: 2, nullable: false),
                    PhysicalHeight = table.Column<float>(type: "real", precision: 6, scale: 2, nullable: false),
                    DensityDpi = table.Column<int>(type: "integer", nullable: false),
                    Manufacturer = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AndroidVersion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ApiLevel = table.Column<int>(type: "integer", nullable: false),
                    BuildFingerprint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SupportedFormats = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    CodecCapabilities = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    AdditionalSpecs = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    DetectedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    IsAutoDetected = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DetectionSource = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true, defaultValue: "system"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceHardwareProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceHardwareProfiles_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MediaVariants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MediaId = table.Column<int>(type: "integer", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: false),
                    Height = table.Column<int>(type: "integer", nullable: false),
                    Quality = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    Format = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    S3Key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CloudFrontUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    TargetResolution = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsOriginal = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaVariants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MediaVariants_Medias_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HardwareDetectionJobs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceRegistrationRequestId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    StartedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    CompletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RetryCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ProfileCreated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeviceHardwareProfileId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HardwareDetectionJobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HardwareDetectionJobs_DeviceHardwareProfiles_DeviceHardware~",
                        column: x => x.DeviceHardwareProfileId,
                        principalTable: "DeviceHardwareProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_HardwareDetectionJobs_DeviceRegistrationRequests_DeviceRegi~",
                        column: x => x.DeviceRegistrationRequestId,
                        principalTable: "DeviceRegistrationRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_HardwareProcessed",
                table: "DeviceRegistrationRequests",
                column: "HardwareProcessed");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_HasHardwareInfo",
                table: "DeviceRegistrationRequests",
                column: "HasHardwareInfo");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfile_CreatedAt",
                table: "DeviceHardwareProfiles",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfile_UpdatedAt",
                table: "DeviceHardwareProfiles",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfiles_DetectedAt",
                table: "DeviceHardwareProfiles",
                column: "DetectedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfiles_DeviceId",
                table: "DeviceHardwareProfiles",
                column: "DeviceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfiles_Manufacturer",
                table: "DeviceHardwareProfiles",
                column: "Manufacturer");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfiles_Model",
                table: "DeviceHardwareProfiles",
                column: "Model");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJob_CreatedAt",
                table: "HardwareDetectionJobs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJob_UpdatedAt",
                table: "HardwareDetectionJobs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_DeviceHardwareProfileId",
                table: "HardwareDetectionJobs",
                column: "DeviceHardwareProfileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_DeviceRegistrationRequestId",
                table: "HardwareDetectionJobs",
                column: "DeviceRegistrationRequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_ProfileCreated",
                table: "HardwareDetectionJobs",
                column: "ProfileCreated");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_RetryCount",
                table: "HardwareDetectionJobs",
                column: "RetryCount");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_StartedAt",
                table: "HardwareDetectionJobs",
                column: "StartedAt");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_Status",
                table: "HardwareDetectionJobs",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_Status_StartedAt",
                table: "HardwareDetectionJobs",
                columns: new[] { "Status", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariant_CreatedAt",
                table: "MediaVariants",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariant_UpdatedAt",
                table: "MediaVariants",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_IsOriginal",
                table: "MediaVariants",
                column: "IsOriginal");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_MediaId",
                table: "MediaVariants",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_MediaId_TargetResolution",
                table: "MediaVariants",
                columns: new[] { "MediaId", "TargetResolution" });

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_Quality",
                table: "MediaVariants",
                column: "Quality");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_Width_Height",
                table: "MediaVariants",
                columns: new[] { "Width", "Height" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HardwareDetectionJobs");

            migrationBuilder.DropTable(
                name: "MediaVariants");

            migrationBuilder.DropTable(
                name: "DeviceHardwareProfiles");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_HardwareProcessed",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequests_HasHardwareInfo",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "HardwareInfo",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "HardwareProcessed",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "HardwareProcessedAt",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "HasHardwareInfo",
                table: "DeviceRegistrationRequests");
        }
    }
}
