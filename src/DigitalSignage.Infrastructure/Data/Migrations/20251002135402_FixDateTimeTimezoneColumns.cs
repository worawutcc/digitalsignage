using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixDateTimeTimezoneColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WebSocketConnectionLog_ConnectedAt",
                table: "WebSocketConnectionLogs");

            migrationBuilder.DropIndex(
                name: "IX_Services_RegisteredAt",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_ServiceInstances_RegisteredAt",
                table: "ServiceInstances");

            migrationBuilder.DropIndex(
                name: "IX_PlaybackStates_LastUpdatedAt",
                table: "PlaybackStates");

            migrationBuilder.DropIndex(
                name: "IX_HealthCheckResults_CheckedAt",
                table: "HealthCheckResults");

            migrationBuilder.DropIndex(
                name: "IX_HealthCheckResults_ServiceId_CheckedAt",
                table: "HealthCheckResults");

            migrationBuilder.DropIndex(
                name: "IX_HealthCheckResults_ServiceInstanceId_CheckedAt",
                table: "HealthCheckResults");

            migrationBuilder.DropColumn(
                name: "ConnectedAt",
                table: "WebSocketConnectionLogs");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "UserSchedules");

            migrationBuilder.DropColumn(
                name: "RegisteredAt",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "RegisteredAt",
                table: "ServiceInstances");

            migrationBuilder.DropColumn(
                name: "LastUpdatedAt",
                table: "PlaybackStates");

            migrationBuilder.DropColumn(
                name: "StartedAt",
                table: "PlaybackStates");

            migrationBuilder.DropColumn(
                name: "CheckedAt",
                table: "HealthCheckResults");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "WebSocketConnectionLogs",
                newName: "updated_by");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "WebSocketConnectionLogs",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "DisconnectedAt",
                table: "WebSocketConnectionLogs",
                newName: "disconnected_at");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "WebSocketConnectionLogs",
                newName: "created_by");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "WebSocketConnectionLogs",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "UserDeviceGroupPermissions",
                newName: "updated_by");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "UserDeviceGroupPermissions",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "UserDeviceGroupPermissions",
                newName: "created_by");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "UserDeviceGroupPermissions",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_UserDeviceGroupPermissions_CreatedBy",
                table: "UserDeviceGroupPermissions",
                newName: "IX_UserDeviceGroupPermissions_created_by");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Services",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "LastHeartbeat",
                table: "Services",
                newName: "last_heartbeat");

            migrationBuilder.RenameColumn(
                name: "LastHealthCheck",
                table: "Services",
                newName: "last_health_check");

            migrationBuilder.RenameIndex(
                name: "IX_Services_LastHeartbeat",
                table: "Services",
                newName: "IX_Services_last_heartbeat");

            migrationBuilder.RenameColumn(
                name: "LastSeen",
                table: "ServiceInstances",
                newName: "last_seen");

            migrationBuilder.RenameColumn(
                name: "DeregisteredAt",
                table: "ServiceInstances",
                newName: "deregistered_at");

            migrationBuilder.RenameIndex(
                name: "IX_ServiceInstances_LastSeen",
                table: "ServiceInstances",
                newName: "IX_ServiceInstances_last_seen");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Schedules",
                newName: "start_date");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "Schedules",
                newName: "end_date");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Scenes",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Scenes",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Scenes_CreatedAt",
                table: "Scenes",
                newName: "IX_Scene_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "SceneItems",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "SceneItems",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Playlists",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Playlists",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Playlists_CreatedAt",
                table: "Playlists",
                newName: "IX_Playlist_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "PlaylistItems",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "PlaylistItems",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "PlaylistAssignments",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "PlaylistAssignments",
                newName: "start_date");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "PlaylistAssignments",
                newName: "end_date");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "PlaylistAssignments",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_PlaylistAssignments_StartDate",
                table: "PlaylistAssignments",
                newName: "IX_PlaylistAssignments_start_date");

            migrationBuilder.RenameIndex(
                name: "IX_PlaylistAssignments_EndDate",
                table: "PlaylistAssignments",
                newName: "IX_PlaylistAssignments_end_date");

            migrationBuilder.RenameColumn(
                name: "EstimatedEndAt",
                table: "PlaybackStates",
                newName: "estimated_end_at");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "PermissionAuditLogs",
                newName: "updated_by");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "PermissionAuditLogs",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "PermissionAuditLogs",
                newName: "created_by");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "PermissionAuditLogs",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "LastHeartbeat",
                table: "Devices",
                newName: "last_heartbeat");

            migrationBuilder.AlterColumn<int>(
                name: "updated_by",
                table: "WebSocketConnectionLogs",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "WebSocketConnectionLogs",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "disconnected_at",
                table: "WebSocketConnectionLogs",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "WebSocketConnectionLogs",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "WebSocketConnectionLogs",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<int>(
                name: "updated_by",
                table: "UserDeviceGroupPermissions",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "UserDeviceGroupPermissions",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "UserDeviceGroupPermissions",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Services",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "last_heartbeat",
                table: "Services",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "last_health_check",
                table: "Services",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Services",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "Services",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "Services",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "last_seen",
                table: "ServiceInstances",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "deregistered_at",
                table: "ServiceInstances",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "ServiceInstances",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "ServiceInstances",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "ServiceInstances",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "ServiceInstances",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "start_date",
                table: "Schedules",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "end_date",
                table: "Schedules",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Scenes",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Scenes",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "Scenes",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "Scenes",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "SceneItems",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "SceneItems",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "SceneItems",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "SceneItems",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Playlists",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Playlists",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "Playlists",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "Playlists",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "PlaylistItems",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "PlaylistItems",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "PlaylistItems",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "PlaylistItems",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "PlaylistAssignments",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "start_date",
                table: "PlaylistAssignments",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "end_date",
                table: "PlaylistAssignments",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "PlaylistAssignments",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "PlaylistAssignments",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "PlaylistAssignments",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "estimated_end_at",
                table: "PlaybackStates",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "PlaybackStates",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "PlaybackStates",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "PlaybackStates",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "PlaybackStates",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<int>(
                name: "updated_by",
                table: "PermissionAuditLogs",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "PermissionAuditLogs",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "PermissionAuditLogs",
                type: "integer",
                nullable: false,
                defaultValue: -1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "HealthCheckResults",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "created_by",
                table: "HealthCheckResults",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "HealthCheckResults",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "updated_by",
                table: "HealthCheckResults",
                type: "integer",
                nullable: false,
                defaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "last_heartbeat",
                table: "Devices",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_CreatedAt",
                table: "WebSocketConnectionLogs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_UpdatedAt",
                table: "WebSocketConnectionLogs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermission_CreatedAt",
                table: "UserDeviceGroupPermissions",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermission_UpdatedAt",
                table: "UserDeviceGroupPermissions",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Service_CreatedAt",
                table: "Services",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Service_UpdatedAt",
                table: "Services",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstance_CreatedAt",
                table: "ServiceInstances",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstance_UpdatedAt",
                table: "ServiceInstances",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Scene_UpdatedAt",
                table: "Scenes",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_SceneItem_CreatedAt",
                table: "SceneItems",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_SceneItem_UpdatedAt",
                table: "SceneItems",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Playlist_UpdatedAt",
                table: "Playlists",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistItem_CreatedAt",
                table: "PlaylistItems",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistItem_UpdatedAt",
                table: "PlaylistItems",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignment_CreatedAt",
                table: "PlaylistAssignments",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignment_UpdatedAt",
                table: "PlaylistAssignments",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackState_CreatedAt",
                table: "PlaybackStates",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackState_UpdatedAt",
                table: "PlaybackStates",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLog_UpdatedAt",
                table: "PermissionAuditLogs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResult_CreatedAt",
                table: "HealthCheckResults",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResult_UpdatedAt",
                table: "HealthCheckResults",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResults_ServiceId_created_at",
                table: "HealthCheckResults",
                columns: new[] { "ServiceId", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResults_ServiceInstanceId_created_at",
                table: "HealthCheckResults",
                columns: new[] { "ServiceInstanceId", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WebSocketConnectionLog_CreatedAt",
                table: "WebSocketConnectionLogs");

            migrationBuilder.DropIndex(
                name: "IX_WebSocketConnectionLog_UpdatedAt",
                table: "WebSocketConnectionLogs");

            migrationBuilder.DropIndex(
                name: "IX_UserDeviceGroupPermission_CreatedAt",
                table: "UserDeviceGroupPermissions");

            migrationBuilder.DropIndex(
                name: "IX_UserDeviceGroupPermission_UpdatedAt",
                table: "UserDeviceGroupPermissions");

            migrationBuilder.DropIndex(
                name: "IX_Service_CreatedAt",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Service_UpdatedAt",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_ServiceInstance_CreatedAt",
                table: "ServiceInstances");

            migrationBuilder.DropIndex(
                name: "IX_ServiceInstance_UpdatedAt",
                table: "ServiceInstances");

            migrationBuilder.DropIndex(
                name: "IX_Scene_UpdatedAt",
                table: "Scenes");

            migrationBuilder.DropIndex(
                name: "IX_SceneItem_CreatedAt",
                table: "SceneItems");

            migrationBuilder.DropIndex(
                name: "IX_SceneItem_UpdatedAt",
                table: "SceneItems");

            migrationBuilder.DropIndex(
                name: "IX_Playlist_UpdatedAt",
                table: "Playlists");

            migrationBuilder.DropIndex(
                name: "IX_PlaylistItem_CreatedAt",
                table: "PlaylistItems");

            migrationBuilder.DropIndex(
                name: "IX_PlaylistItem_UpdatedAt",
                table: "PlaylistItems");

            migrationBuilder.DropIndex(
                name: "IX_PlaylistAssignment_CreatedAt",
                table: "PlaylistAssignments");

            migrationBuilder.DropIndex(
                name: "IX_PlaylistAssignment_UpdatedAt",
                table: "PlaylistAssignments");

            migrationBuilder.DropIndex(
                name: "IX_PlaybackState_CreatedAt",
                table: "PlaybackStates");

            migrationBuilder.DropIndex(
                name: "IX_PlaybackState_UpdatedAt",
                table: "PlaybackStates");

            migrationBuilder.DropIndex(
                name: "IX_PermissionAuditLog_UpdatedAt",
                table: "PermissionAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_HealthCheckResult_CreatedAt",
                table: "HealthCheckResults");

            migrationBuilder.DropIndex(
                name: "IX_HealthCheckResult_UpdatedAt",
                table: "HealthCheckResults");

            migrationBuilder.DropIndex(
                name: "IX_HealthCheckResults_ServiceId_created_at",
                table: "HealthCheckResults");

            migrationBuilder.DropIndex(
                name: "IX_HealthCheckResults_ServiceInstanceId_created_at",
                table: "HealthCheckResults");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "ServiceInstances");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "ServiceInstances");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "ServiceInstances");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "ServiceInstances");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "Scenes");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "Scenes");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "SceneItems");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "SceneItems");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "Playlists");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "Playlists");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "PlaylistItems");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "PlaylistItems");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "PlaylistAssignments");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "PlaylistAssignments");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "PlaybackStates");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "PlaybackStates");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "PlaybackStates");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "PlaybackStates");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "HealthCheckResults");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "HealthCheckResults");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "HealthCheckResults");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "HealthCheckResults");

            migrationBuilder.RenameColumn(
                name: "updated_by",
                table: "WebSocketConnectionLogs",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "WebSocketConnectionLogs",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "disconnected_at",
                table: "WebSocketConnectionLogs",
                newName: "DisconnectedAt");

            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "WebSocketConnectionLogs",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "WebSocketConnectionLogs",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "updated_by",
                table: "UserDeviceGroupPermissions",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "UserDeviceGroupPermissions",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "UserDeviceGroupPermissions",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "UserDeviceGroupPermissions",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_UserDeviceGroupPermissions_created_by",
                table: "UserDeviceGroupPermissions",
                newName: "IX_UserDeviceGroupPermissions_CreatedBy");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Services",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "last_heartbeat",
                table: "Services",
                newName: "LastHeartbeat");

            migrationBuilder.RenameColumn(
                name: "last_health_check",
                table: "Services",
                newName: "LastHealthCheck");

            migrationBuilder.RenameIndex(
                name: "IX_Services_last_heartbeat",
                table: "Services",
                newName: "IX_Services_LastHeartbeat");

            migrationBuilder.RenameColumn(
                name: "last_seen",
                table: "ServiceInstances",
                newName: "LastSeen");

            migrationBuilder.RenameColumn(
                name: "deregistered_at",
                table: "ServiceInstances",
                newName: "DeregisteredAt");

            migrationBuilder.RenameIndex(
                name: "IX_ServiceInstances_last_seen",
                table: "ServiceInstances",
                newName: "IX_ServiceInstances_LastSeen");

            migrationBuilder.RenameColumn(
                name: "start_date",
                table: "Schedules",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "end_date",
                table: "Schedules",
                newName: "EndDate");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Scenes",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Scenes",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_Scene_CreatedAt",
                table: "Scenes",
                newName: "IX_Scenes_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "SceneItems",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "SceneItems",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Playlists",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Playlists",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_Playlist_CreatedAt",
                table: "Playlists",
                newName: "IX_Playlists_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "PlaylistItems",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "PlaylistItems",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "PlaylistAssignments",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "start_date",
                table: "PlaylistAssignments",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "end_date",
                table: "PlaylistAssignments",
                newName: "EndDate");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "PlaylistAssignments",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_PlaylistAssignments_start_date",
                table: "PlaylistAssignments",
                newName: "IX_PlaylistAssignments_StartDate");

            migrationBuilder.RenameIndex(
                name: "IX_PlaylistAssignments_end_date",
                table: "PlaylistAssignments",
                newName: "IX_PlaylistAssignments_EndDate");

            migrationBuilder.RenameColumn(
                name: "estimated_end_at",
                table: "PlaybackStates",
                newName: "EstimatedEndAt");

            migrationBuilder.RenameColumn(
                name: "updated_by",
                table: "PermissionAuditLogs",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "PermissionAuditLogs",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "PermissionAuditLogs",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "PermissionAuditLogs",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "last_heartbeat",
                table: "Devices",
                newName: "LastHeartbeat");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedBy",
                table: "WebSocketConnectionLogs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "WebSocketConnectionLogs",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DisconnectedAt",
                table: "WebSocketConnectionLogs",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "WebSocketConnectionLogs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "WebSocketConnectionLogs",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTime>(
                name: "ConnectedAt",
                table: "WebSocketConnectionLogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "UserSchedules",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                comment: "When this schedule was assigned to the user (UTC)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedBy",
                table: "UserDeviceGroupPermissions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserDeviceGroupPermissions",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "UserDeviceGroupPermissions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Services",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastHeartbeat",
                table: "Services",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastHealthCheck",
                table: "Services",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RegisteredAt",
                table: "Services",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastSeen",
                table: "ServiceInstances",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DeregisteredAt",
                table: "ServiceInstances",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RegisteredAt",
                table: "ServiceInstances",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "Schedules",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "Schedules",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Scenes",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Scenes",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "SceneItems",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "SceneItems",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Playlists",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Playlists",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "PlaylistItems",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PlaylistItems",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "PlaylistAssignments",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "PlaylistAssignments",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "PlaylistAssignments",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PlaylistAssignments",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EstimatedEndAt",
                table: "PlaybackStates",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdatedAt",
                table: "PlaybackStates",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAt",
                table: "PlaybackStates",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedBy",
                table: "PermissionAuditLogs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "PermissionAuditLogs",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "PermissionAuditLogs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: -1);

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckedAt",
                table: "HealthCheckResults",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastHeartbeat",
                table: "Devices",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_ConnectedAt",
                table: "WebSocketConnectionLogs",
                column: "ConnectedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Services_RegisteredAt",
                table: "Services",
                column: "RegisteredAt");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_RegisteredAt",
                table: "ServiceInstances",
                column: "RegisteredAt");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackStates_LastUpdatedAt",
                table: "PlaybackStates",
                column: "LastUpdatedAt");

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
        }
    }
}
