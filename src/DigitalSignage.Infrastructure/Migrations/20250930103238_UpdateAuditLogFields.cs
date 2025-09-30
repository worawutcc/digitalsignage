using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAuditLogFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PermissionAuditLogs_Users_ChangedBy",
                table: "PermissionAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_PermissionAuditLogs_ChangedAt",
                table: "PermissionAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_PermissionAuditLogs_ChangedBy",
                table: "PermissionAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_PermissionAuditLogs_UserId_ChangedAt",
                table: "PermissionAuditLogs");

            migrationBuilder.DropColumn(
                name: "ChangedAt",
                table: "PermissionAuditLogs");

            migrationBuilder.RenameColumn(
                name: "ChangedBy",
                table: "PermissionAuditLogs",
                newName: "UpdatedBy");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserDeviceGroupPermissions",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                comment: "UTC timestamp when permission was created",
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()",
                oldComment: "UTC timestamp when permission was created");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserDeviceGroupPermissions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "UpdatedBy",
                table: "UserDeviceGroupPermissions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "UserDeviceAssociations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "UserDeviceAssociations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserDeviceAssociations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "UpdatedBy",
                table: "UserDeviceAssociations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "PermissionAuditLogs",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                comment: "UTC timestamp when change occurred");

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "PermissionAuditLogs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "PermissionAuditLogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_CreatedAt",
                table: "PermissionAuditLogs",
                column: "CreatedAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_CreatedBy",
                table: "PermissionAuditLogs",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_UserId_CreatedAt",
                table: "PermissionAuditLogs",
                columns: new[] { "UserId", "CreatedAt" },
                descending: new[] { false, true });

            migrationBuilder.AddForeignKey(
                name: "FK_PermissionAuditLogs_Users_CreatedBy",
                table: "PermissionAuditLogs",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PermissionAuditLogs_Users_CreatedBy",
                table: "PermissionAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_PermissionAuditLogs_CreatedAt",
                table: "PermissionAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_PermissionAuditLogs_CreatedBy",
                table: "PermissionAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_PermissionAuditLogs_UserId_CreatedAt",
                table: "PermissionAuditLogs");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "UserDeviceGroupPermissions");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "UserDeviceGroupPermissions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "UserDeviceAssociations");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "UserDeviceAssociations");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "UserDeviceAssociations");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "UserDeviceAssociations");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PermissionAuditLogs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PermissionAuditLogs");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "PermissionAuditLogs");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "PermissionAuditLogs",
                newName: "ChangedBy");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "UserDeviceGroupPermissions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                comment: "UTC timestamp when permission was created",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "NOW()",
                oldComment: "UTC timestamp when permission was created");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ChangedAt",
                table: "PermissionAuditLogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                comment: "UTC timestamp when change occurred");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_ChangedAt",
                table: "PermissionAuditLogs",
                column: "ChangedAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_ChangedBy",
                table: "PermissionAuditLogs",
                column: "ChangedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_UserId_ChangedAt",
                table: "PermissionAuditLogs",
                columns: new[] { "UserId", "ChangedAt" },
                descending: new[] { false, true });

            migrationBuilder.AddForeignKey(
                name: "FK_PermissionAuditLogs_Users_ChangedBy",
                table: "PermissionAuditLogs",
                column: "ChangedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
