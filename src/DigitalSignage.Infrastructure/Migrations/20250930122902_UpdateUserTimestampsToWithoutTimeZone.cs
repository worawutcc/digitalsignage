using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserTimestampsToWithoutTimeZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserDeviceAssociations_Devices_DeviceId1",
                table: "UserDeviceAssociations");

            migrationBuilder.DropForeignKey(
                name: "FK_UserDeviceAssociations_Users_UserId1",
                table: "UserDeviceAssociations");

            migrationBuilder.DropIndex(
                name: "IX_UserDeviceAssociations_DeviceId1",
                table: "UserDeviceAssociations");

            migrationBuilder.DropIndex(
                name: "IX_UserDeviceAssociations_UserId1",
                table: "UserDeviceAssociations");

            migrationBuilder.DropColumn(
                name: "DeviceId1",
                table: "UserDeviceAssociations");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "UserDeviceAssociations");

            migrationBuilder.AlterColumn<DateTime>(
                name: "LockoutUntil",
                table: "Users",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastLoginAt",
                table: "Users",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.DropTable(
                name: "UserDeviceAssociations"
            );

            migrationBuilder.CreateTable(
                name: "UserDeviceAssociations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    // Add other columns as needed
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDeviceAssociations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDeviceAssociations_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserDeviceAssociations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociations_DeviceId",
                table: "UserDeviceAssociations",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociations_UserId",
                table: "UserDeviceAssociations",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserDeviceAssociations_Devices_DeviceId",
                table: "UserDeviceAssociations");

            migrationBuilder.DropForeignKey(
                name: "FK_UserDeviceAssociations_Users_UserId",
                table: "UserDeviceAssociations");

            migrationBuilder.DropIndex(
                name: "IX_UserDeviceAssociations_DeviceId",
                table: "UserDeviceAssociations");

            migrationBuilder.DropIndex(
                name: "IX_UserDeviceAssociations_UserId",
                table: "UserDeviceAssociations");

            migrationBuilder.AlterColumn<DateTime>(
                name: "LockoutUntil",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastLoginAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "UserDeviceAssociations",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "DeviceId",
                table: "UserDeviceAssociations",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "UserDeviceAssociations",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "DeviceId1",
                table: "UserDeviceAssociations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "UserDeviceAssociations",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociations_DeviceId1",
                table: "UserDeviceAssociations",
                column: "DeviceId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociations_UserId1",
                table: "UserDeviceAssociations",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_UserDeviceAssociations_Devices_DeviceId1",
                table: "UserDeviceAssociations",
                column: "DeviceId1",
                principalTable: "Devices",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserDeviceAssociations_Users_UserId1",
                table: "UserDeviceAssociations",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
