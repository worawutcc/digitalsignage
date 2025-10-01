using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BaseEntityAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DeviceApprovals_ApprovedAt",
                table: "DeviceApprovals");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "DeviceApprovals");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Users",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Users",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Schedules",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Schedules",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "RegistrationAuditLogs",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_RegistrationAuditLogs_CreatedAt",
                table: "RegistrationAuditLogs",
                newName: "IX_RegistrationAuditLog_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "RefreshTokens",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Medias",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Medias",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Medias_CreatedAt",
                table: "Medias",
                newName: "IX_Media_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Devices",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Devices",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "DeviceRegistrationRequests",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_DeviceRegistrationRequests_CreatedAt",
                table: "DeviceRegistrationRequests",
                newName: "IX_DeviceRegistrationRequest_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "DeviceGroups",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "DeviceGroups",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_DeviceGroups_CreatedAt",
                table: "DeviceGroups",
                newName: "IX_DeviceGroup_CreatedAt");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Users",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Users",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Schedules",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Schedules",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Schedules",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "Schedules",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "Schedules",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "ScheduleMedias",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "ScheduleMedias",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "ScheduleMedias",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "ScheduleMedias",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "RegistrationAuditLogs",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "RegistrationAuditLogs",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "RegistrationAuditLogs",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "RegistrationAuditLogs",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "RefreshTokens",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "RefreshTokens",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "RefreshTokens",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "RefreshTokens",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Medias",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Medias",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "Medias",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "Medias",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Devices",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Devices",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "Devices",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "Devices",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "DeviceRegistrationRequests",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "DeviceRegistrationRequests",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "DeviceRegistrationRequests",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "DeviceRegistrationRequests",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "DeviceGroups",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "DeviceGroups",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "DeviceGroups",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "DeviceGroups",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "DeviceApprovals",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "DeviceApprovals",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "DeviceApprovals",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "DeviceApprovals",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.CreateIndex(
                name: "IX_User_CreatedAt",
                table: "Users",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_User_UpdatedAt",
                table: "Users",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_CreatedAt",
                table: "Schedules",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_UpdatedAt",
                table: "Schedules",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleMedia_CreatedAt",
                table: "ScheduleMedias",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleMedia_UpdatedAt",
                table: "ScheduleMedias",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLog_UpdatedAt",
                table: "RegistrationAuditLogs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_CreatedAt",
                table: "RefreshTokens",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UpdatedAt",
                table: "RefreshTokens",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Media_UpdatedAt",
                table: "Medias",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Device_CreatedAt",
                table: "Devices",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Device_UpdatedAt",
                table: "Devices",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequest_UpdatedAt",
                table: "DeviceRegistrationRequests",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroup_UpdatedAt",
                table: "DeviceGroups",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApproval_CreatedAt",
                table: "DeviceApprovals",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApproval_UpdatedAt",
                table: "DeviceApprovals",
                column: "updated_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_User_CreatedAt",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_User_UpdatedAt",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Schedule_CreatedAt",
                table: "Schedules");

            migrationBuilder.DropIndex(
                name: "IX_Schedule_UpdatedAt",
                table: "Schedules");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleMedia_CreatedAt",
                table: "ScheduleMedias");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleMedia_UpdatedAt",
                table: "ScheduleMedias");

            migrationBuilder.DropIndex(
                name: "IX_RegistrationAuditLog_UpdatedAt",
                table: "RegistrationAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_RefreshToken_CreatedAt",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_RefreshToken_UpdatedAt",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_Media_UpdatedAt",
                table: "Medias");

            migrationBuilder.DropIndex(
                name: "IX_Device_CreatedAt",
                table: "Devices");

            migrationBuilder.DropIndex(
                name: "IX_Device_UpdatedAt",
                table: "Devices");

            migrationBuilder.DropIndex(
                name: "IX_DeviceRegistrationRequest_UpdatedAt",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropIndex(
                name: "IX_DeviceGroup_UpdatedAt",
                table: "DeviceGroups");

            migrationBuilder.DropIndex(
                name: "IX_DeviceApproval_CreatedAt",
                table: "DeviceApprovals");

            migrationBuilder.DropIndex(
                name: "IX_DeviceApproval_UpdatedAt",
                table: "DeviceApprovals");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "ScheduleMedias");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "ScheduleMedias");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "ScheduleMedias");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "ScheduleMedias");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "RegistrationAuditLogs");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "RegistrationAuditLogs");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "RegistrationAuditLogs");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "Medias");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "Medias");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "DeviceRegistrationRequests");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "DeviceGroups");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "DeviceGroups");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "DeviceApprovals");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "DeviceApprovals");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "DeviceApprovals");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "DeviceApprovals");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Users",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Users",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Schedules",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Schedules",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "RegistrationAuditLogs",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_RegistrationAuditLog_CreatedAt",
                table: "RegistrationAuditLogs",
                newName: "IX_RegistrationAuditLogs_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "RefreshTokens",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Medias",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Medias",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_Media_CreatedAt",
                table: "Medias",
                newName: "IX_Medias_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Devices",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Devices",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "DeviceRegistrationRequests",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_DeviceRegistrationRequest_CreatedAt",
                table: "DeviceRegistrationRequests",
                newName: "IX_DeviceRegistrationRequests_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "DeviceGroups",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "DeviceGroups",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_DeviceGroup_CreatedAt",
                table: "DeviceGroups",
                newName: "IX_DeviceGroups_CreatedAt");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Schedules",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Schedules",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Schedules",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "RegistrationAuditLogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RefreshTokens",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Medias",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Medias",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Devices",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Devices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "DeviceRegistrationRequests",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "DeviceGroups",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceGroups",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ApprovedAt",
                table: "DeviceApprovals",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApprovals_ApprovedAt",
                table: "DeviceApprovals",
                column: "ApprovedAt");
        }
    }
}
