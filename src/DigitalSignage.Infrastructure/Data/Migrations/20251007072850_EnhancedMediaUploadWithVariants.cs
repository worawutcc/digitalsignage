using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class EnhancedMediaUploadWithVariants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Bitrate",
                table: "MediaVariants",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "MediaVariants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ETag",
                table: "MediaVariants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "QualityScore",
                table: "MediaVariants",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VariantType",
                table: "MediaVariants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "OriginalBitrate",
                table: "Medias",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OriginalHeight",
                table: "Medias",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalKey",
                table: "Medias",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OriginalWidth",
                table: "Medias",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProcessedAt",
                table: "Medias",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProcessingError",
                table: "Medias",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Medias",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "DeviceCapabilities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    MaxWidth = table.Column<int>(type: "integer", nullable: false, defaultValue: 1920),
                    MaxHeight = table.Column<int>(type: "integer", nullable: false, defaultValue: 1080),
                    MaxBitrate = table.Column<int>(type: "integer", nullable: false, defaultValue: 5000),
                    SupportedFormats = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[\"mp4\",\"jpg\",\"webp\"]"),
                    NetworkType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "wifi"),
                    BandwidthKbps = table.Column<int>(type: "integer", nullable: false, defaultValue: 10000),
                    CpuScore = table.Column<int>(type: "integer", nullable: false, defaultValue: 50),
                    RamMb = table.Column<int>(type: "integer", nullable: false, defaultValue: 2048),
                    StorageMb = table.Column<int>(type: "integer", nullable: false, defaultValue: 8192),
                    LastUpdated = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceCapabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceCapabilities_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_MediaId_VariantType",
                table: "MediaVariants",
                columns: new[] { "MediaId", "VariantType" });

            migrationBuilder.CreateIndex(
                name: "IX_Medias_OriginalKey",
                table: "Medias",
                column: "OriginalKey");

            migrationBuilder.CreateIndex(
                name: "IX_Medias_Status",
                table: "Medias",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapabilities_DeviceId",
                table: "DeviceCapabilities",
                column: "DeviceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapabilities_NetworkType",
                table: "DeviceCapabilities",
                column: "NetworkType");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapabilities_Resolution",
                table: "DeviceCapabilities",
                columns: new[] { "MaxWidth", "MaxHeight" });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapability_CreatedAt",
                table: "DeviceCapabilities",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapability_UpdatedAt",
                table: "DeviceCapabilities",
                column: "updated_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeviceCapabilities");

            migrationBuilder.DropIndex(
                name: "IX_MediaVariants_MediaId_VariantType",
                table: "MediaVariants");

            migrationBuilder.DropIndex(
                name: "IX_Medias_OriginalKey",
                table: "Medias");

            migrationBuilder.DropIndex(
                name: "IX_Medias_Status",
                table: "Medias");

            migrationBuilder.DropColumn(
                name: "Bitrate",
                table: "MediaVariants");

            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "MediaVariants");

            migrationBuilder.DropColumn(
                name: "ETag",
                table: "MediaVariants");

            migrationBuilder.DropColumn(
                name: "QualityScore",
                table: "MediaVariants");

            migrationBuilder.DropColumn(
                name: "VariantType",
                table: "MediaVariants");

            migrationBuilder.DropColumn(
                name: "OriginalBitrate",
                table: "Medias");

            migrationBuilder.DropColumn(
                name: "OriginalHeight",
                table: "Medias");

            migrationBuilder.DropColumn(
                name: "OriginalKey",
                table: "Medias");

            migrationBuilder.DropColumn(
                name: "OriginalWidth",
                table: "Medias");

            migrationBuilder.DropColumn(
                name: "ProcessedAt",
                table: "Medias");

            migrationBuilder.DropColumn(
                name: "ProcessingError",
                table: "Medias");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Medias");
        }
    }
}
