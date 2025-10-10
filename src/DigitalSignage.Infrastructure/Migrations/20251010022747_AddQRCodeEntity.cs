using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQRCodeEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QRCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Scans = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LastScanned = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "active"),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DeviceId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DeviceName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ImagePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QRCodes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QRCodes_CreatedAt",
                table: "QRCodes",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_QRCodes_DeviceId",
                table: "QRCodes",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_QRCodes_ExpiryDate",
                table: "QRCodes",
                column: "ExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_QRCodes_Name",
                table: "QRCodes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_QRCodes_Status",
                table: "QRCodes",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_QRCodes_Type",
                table: "QRCodes",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QRCodes");
        }
    }
}
