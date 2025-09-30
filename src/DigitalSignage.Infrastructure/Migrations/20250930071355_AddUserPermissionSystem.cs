using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPermissionSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PermissionAuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    DeviceGroupId = table.Column<int>(type: "integer", nullable: false),
                    PreviousPermission = table.Column<int>(type: "integer", nullable: true, comment: "Permission level before change (null for new permissions)"),
                    NewPermission = table.Column<int>(type: "integer", nullable: true, comment: "Permission level after change (null for deleted permissions)"),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, comment: "Action type: GRANTED, MODIFIED, REVOKED"),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true, comment: "Admin-provided reason for the permission change"),
                    ChangedBy = table.Column<int>(type: "integer", nullable: false),
                    ChangedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()", comment: "UTC timestamp when change occurred"),
                    Context = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true, comment: "Additional context (IP address, user agent, etc.)")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissionAuditLogs", x => x.Id);
                    table.CheckConstraint("CK_PermissionAuditLogs_ActionConsistency", "(\"Action\" = 'GRANTED' AND \"PreviousPermission\" IS NULL AND \"NewPermission\" IS NOT NULL) OR (\"Action\" = 'MODIFIED' AND \"PreviousPermission\" IS NOT NULL AND \"NewPermission\" IS NOT NULL) OR (\"Action\" = 'REVOKED' AND \"PreviousPermission\" IS NOT NULL AND \"NewPermission\" IS NULL)");
                    table.CheckConstraint("CK_PermissionAuditLogs_HasPermissionValue", "\"PreviousPermission\" IS NOT NULL OR \"NewPermission\" IS NOT NULL");
                    table.CheckConstraint("CK_PermissionAuditLogs_ValidAction", "\"Action\" IN ('GRANTED', 'MODIFIED', 'REVOKED')");
                    table.CheckConstraint("CK_PermissionAuditLogs_ValidPermissionValues", "(\"PreviousPermission\" IS NULL OR (\"PreviousPermission\" >= 0 AND \"PreviousPermission\" <= 3)) AND (\"NewPermission\" IS NULL OR (\"NewPermission\" >= 0 AND \"NewPermission\" <= 3))");
                    table.ForeignKey(
                        name: "FK_PermissionAuditLogs_DeviceGroups_DeviceGroupId",
                        column: x => x.DeviceGroupId,
                        principalTable: "DeviceGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PermissionAuditLogs_Users_ChangedBy",
                        column: x => x.ChangedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PermissionAuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "Immutable audit trail of all permission changes for compliance and security tracking");

            migrationBuilder.CreateTable(
                name: "UserDeviceGroupPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    DeviceGroupId = table.Column<int>(type: "integer", nullable: false),
                    Permission = table.Column<int>(type: "integer", nullable: false, comment: "UserPermissionLevel enum: 0=NoAccess, 1=ViewOnly, 2=ManageContent, 3=FullControl"),
                    IsExplicit = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true, comment: "True if explicitly assigned, False if inherited from parent group"),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()", comment: "UTC timestamp when permission was created"),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDeviceGroupPermissions", x => x.Id);
                    table.CheckConstraint("CK_UserDeviceGroupPermissions_Permission", "\"Permission\" >= 0 AND \"Permission\" <= 3");
                    table.ForeignKey(
                        name: "FK_UserDeviceGroupPermissions_DeviceGroups_DeviceGroupId",
                        column: x => x.DeviceGroupId,
                        principalTable: "DeviceGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserDeviceGroupPermissions_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserDeviceGroupPermissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Links users to device groups with specific permission levels, supporting hierarchical inheritance");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_Action",
                table: "PermissionAuditLogs",
                column: "Action");

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
                name: "IX_PermissionAuditLogs_DeviceGroupId",
                table: "PermissionAuditLogs",
                column: "DeviceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_UserId",
                table: "PermissionAuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_UserId_ChangedAt",
                table: "PermissionAuditLogs",
                columns: new[] { "UserId", "ChangedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermissions_CreatedBy",
                table: "UserDeviceGroupPermissions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermissions_DeviceGroupId",
                table: "UserDeviceGroupPermissions",
                column: "DeviceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermissions_UserId",
                table: "UserDeviceGroupPermissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ_UserDeviceGroupPermissions_UserId_DeviceGroupId",
                table: "UserDeviceGroupPermissions",
                columns: new[] { "UserId", "DeviceGroupId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PermissionAuditLogs");

            migrationBuilder.DropTable(
                name: "UserDeviceGroupPermissions");
        }
    }
}
