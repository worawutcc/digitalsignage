using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCleanUtcTimestamps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Medias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FileName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    S3Key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    OriginalKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ProcessingError = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    OriginalWidth = table.Column<int>(type: "integer", nullable: true),
                    OriginalHeight = table.Column<int>(type: "integer", nullable: true),
                    OriginalBitrate = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medias", x => x.Id);
                });

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
                    last_heartbeat = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    last_health_check = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ConsecutiveHealthCheckFailures = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    FailedLoginAttempts = table.Column<int>(type: "integer", nullable: false),
                    LockoutUntil = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
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
                    VariantType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Quality = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Bitrate = table.Column<int>(type: "integer", nullable: true),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ETag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    QualityScore = table.Column<double>(type: "double precision", nullable: true),
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
                    last_seen = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    deregistered_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    HealthCheckIntervalSeconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    HealthCheckTimeoutSeconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                    MaxConsecutiveFailures = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
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
                name: "DeviceGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false, defaultValue: ""),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ParentGroupId = table.Column<int>(type: "integer", nullable: true),
                    Path = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false, defaultValue: ""),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceGroups_DeviceGroups_ParentGroupId",
                        column: x => x.ParentGroupId,
                        principalTable: "DeviceGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DeviceGroups_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Playlists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsLooped = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LoopCount = table.Column<int>(type: "integer", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Playlists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Playlists_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Scenes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    LayoutType = table.Column<int>(type: "integer", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: false, defaultValue: 1920),
                    Height = table.Column<int>(type: "integer", nullable: false, defaultValue: 1080),
                    BackgroundColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    BackgroundImageId = table.Column<int>(type: "integer", nullable: true),
                    IsTemplate = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    TemplateName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scenes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Scenes_Medias_BackgroundImageId",
                        column: x => x.BackgroundImageId,
                        principalTable: "Medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Scenes_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WebSocketConnectionLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConnectionId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    disconnected_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    DisconnectionReason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebSocketConnectionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WebSocketConnectionLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
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
                    ResponseTimeMs = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ResponseMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    AdditionalData = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
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

            migrationBuilder.CreateTable(
                name: "device_group_audit_logs",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_group_id = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    action = table.Column<int>(type: "integer", nullable: false),
                    details = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false, defaultValue: "{}"),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    result = table.Column<int>(type: "integer", nullable: false),
                    error_message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    metadata = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_group_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_device_group_audit_logs_device_group_id",
                        column: x => x.device_group_id,
                        principalTable: "DeviceGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_device_group_audit_logs_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Devices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DeviceKey = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Location = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DeviceType = table.Column<int>(type: "integer", nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    Resolution = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    last_heartbeat = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    last_seen_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    MacAddress = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: false),
                    AndroidVersion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ApiLevel = table.Column<int>(type: "integer", maxLength: 10, nullable: true),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Manufacturer = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DisplayResolution = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    deactivated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DeactivatedBy = table.Column<int>(type: "integer", nullable: true),
                    ManagedByUserId = table.Column<int>(type: "integer", nullable: true),
                    DeviceGroupId = table.Column<int>(type: "integer", nullable: true),
                    AssignedUserId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Devices_DeviceGroups_DeviceGroupId",
                        column: x => x.DeviceGroupId,
                        principalTable: "DeviceGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Devices_Users_AssignedUserId",
                        column: x => x.AssignedUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Devices_Users_DeactivatedBy",
                        column: x => x.DeactivatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Devices_Users_ManagedByUserId",
                        column: x => x.ManagedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

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
                    Context = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true, comment: "Additional context (IP address, user agent, etc.)"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW()", comment: "UTC timestamp when change occurred"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
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
                        name: "FK_PermissionAuditLogs_Users_CreatedBy",
                        column: x => x.created_by,
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
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW()", comment: "UTC timestamp when permission was created"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
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
                        column: x => x.created_by,
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

            migrationBuilder.CreateTable(
                name: "PlaylistItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlaylistId = table.Column<int>(type: "integer", nullable: false),
                    MediaId = table.Column<int>(type: "integer", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    UseCustomDuration = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    TransitionEffect = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    TransitionDurationMs = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsConditional = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaylistItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlaylistItems_Medias_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlaylistItems_Playlists_PlaylistId",
                        column: x => x.PlaylistId,
                        principalTable: "Playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SceneItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SceneId = table.Column<int>(type: "integer", nullable: false),
                    MediaId = table.Column<int>(type: "integer", nullable: false),
                    X = table.Column<int>(type: "integer", nullable: false),
                    Y = table.Column<int>(type: "integer", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: false),
                    Height = table.Column<int>(type: "integer", nullable: false),
                    ZIndex = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Opacity = table.Column<float>(type: "real", precision: 3, scale: 2, nullable: false, defaultValue: 1f),
                    Rotation = table.Column<float>(type: "real", precision: 5, scale: 2, nullable: false, defaultValue: 0f),
                    AnimationIn = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AnimationOut = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AnimationDuration = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    UseCustomDuration = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SceneItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SceneItems_Medias_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SceneItems_Scenes_SceneId",
                        column: x => x.SceneId,
                        principalTable: "Scenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateTable(
                name: "DeviceConfigurations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    DisplayOrientation = table.Column<int>(type: "integer", nullable: false),
                    Resolution = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    RefreshRate = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                    ScreenTimeout = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    PowerManagement = table.Column<int>(type: "integer", nullable: false),
                    NetworkConfig = table.Column<string>(type: "text", nullable: true),
                    AppPermissions = table.Column<string>(type: "text", nullable: true),
                    RemoteManagementEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ProxySettings = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceConfigurations_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeviceConfigurations_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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
                name: "DeviceRegistrationRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RegistrationId = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    MacAddress = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: false),
                    Pin = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    DeviceModel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Manufacturer = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AndroidVersion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AppVersion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    NetworkName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HardwareSpecs = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    HardwareInfo = table.Column<string>(type: "jsonb", maxLength: 2000, nullable: true, comment: "Enhanced hardware information JSON payload from device"),
                    HasHardwareInfo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false, comment: "Flag indicating whether enhanced hardware information was provided"),
                    HardwareProcessed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false, comment: "Flag indicating whether hardware information has been processed"),
                    HardwareProcessedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true, comment: "Timestamp when hardware information was processed"),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Method = table.Column<int>(type: "integer", nullable: false),
                    QrCodeData = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RequestedUsername = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false, comment: "Email or username provided by device during registration"),
                    RequestedUserDisplayName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true, comment: "Optional friendly name provided by device"),
                    MatchedUserId = table.Column<int>(type: "integer", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastPolledAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ApprovedDeviceId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceRegistrationRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceRegistrationRequests_Devices_ApprovedDeviceId",
                        column: x => x.ApprovedDeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DeviceRegistrationRequests_Users_MatchedUserId",
                        column: x => x.MatchedUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "DeviceStatusLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW()"),
                    Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceStatusLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceStatusLogs_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlaybackStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    PlaylistId = table.Column<int>(type: "integer", nullable: false),
                    CurrentItemIndex = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CurrentPositionSeconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    TotalDurationSeconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CurrentLoopCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    TotalLoops = table.Column<int>(type: "integer", nullable: true),
                    IsLooping = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    estimated_end_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ErrorOccurredAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsSynced = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LastSyncAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    SyncToken = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaybackStates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlaybackStates_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlaybackStates_Playlists_PlaylistId",
                        column: x => x.PlaylistId,
                        principalTable: "Playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlaylistAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlaylistId = table.Column<int>(type: "integer", nullable: false),
                    DeviceId = table.Column<int>(type: "integer", nullable: true),
                    DeviceGroupId = table.Column<int>(type: "integer", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    start_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    RecurrencePattern = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DaysOfWeek = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AssignedByUserId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaylistAssignments", x => x.Id);
                    table.CheckConstraint("CK_PlaylistAssignment_Device_Or_Group", "(\"DeviceId\" IS NOT NULL AND \"DeviceGroupId\" IS NULL) OR (\"DeviceId\" IS NULL AND \"DeviceGroupId\" IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_PlaylistAssignments_DeviceGroups_DeviceGroupId",
                        column: x => x.DeviceGroupId,
                        principalTable: "DeviceGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlaylistAssignments_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlaylistAssignments_Playlists_PlaylistId",
                        column: x => x.PlaylistId,
                        principalTable: "Playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlaylistAssignments_Users_AssignedByUserId",
                        column: x => x.AssignedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TokenValue = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    DeviceId = table.Column<int>(type: "integer", nullable: true),
                    IsRevoked = table.Column<bool>(type: "boolean", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ReplacedByToken = table.Column<string>(type: "text", nullable: true),
                    CreatedByIp = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RegistrationRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<int>(type: "integer", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Success = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrationRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrationRecords_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RegistrationRecords_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Schedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false, comment: "Marks this schedule as a fallback when user has no assigned schedules"),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Schedules_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserDeviceAssociations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    DeviceId = table.Column<int>(type: "integer", nullable: false),
                    AssociatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AssociationType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
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
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
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
                        name: "FK_RegistrationAuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
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
                    DeviceKey = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
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
                name: "ScheduleMedias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                    MediaId = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduleMedias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScheduleMedias_Medias_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScheduleMedias_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                    AssignedByUserId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSchedules_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserSchedules_Users_AssignedByUserId",
                        column: x => x.AssignedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_UserSchedules_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_device_group_audit_logs_action",
                table: "device_group_audit_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "ix_device_group_audit_logs_action_created",
                table: "device_group_audit_logs",
                columns: new[] { "action", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_device_group_audit_logs_created_at",
                table: "device_group_audit_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_device_group_audit_logs_device_group_id",
                table: "device_group_audit_logs",
                column: "device_group_id");

            migrationBuilder.CreateIndex(
                name: "ix_device_group_audit_logs_group_created",
                table: "device_group_audit_logs",
                columns: new[] { "device_group_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_device_group_audit_logs_user_created",
                table: "device_group_audit_logs",
                columns: new[] { "user_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_device_group_audit_logs_user_id",
                table: "device_group_audit_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApproval_CreatedAt",
                table: "DeviceApprovals",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApproval_UpdatedAt",
                table: "DeviceApprovals",
                column: "updated_at");

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
                column: "DeviceRegistrationRequestId",
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

            migrationBuilder.CreateIndex(
                name: "IX_DeviceConfigurations_DeviceId",
                table: "DeviceConfigurations",
                column: "DeviceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceConfigurations_UpdatedBy",
                table: "DeviceConfigurations",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroup_CreatedAt",
                table: "DeviceGroups",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroup_UpdatedAt",
                table: "DeviceGroups",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_CreatedByUserId",
                table: "DeviceGroups",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_IsActive",
                table: "DeviceGroups",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_Name",
                table: "DeviceGroups",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_ParentGroupId",
                table: "DeviceGroups",
                column: "ParentGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_ParentGroupId_Name",
                table: "DeviceGroups",
                columns: new[] { "ParentGroupId", "Name" },
                unique: true);

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
                name: "IX_DeviceRegistrationRequest_CreatedAt",
                table: "DeviceRegistrationRequests",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequest_UpdatedAt",
                table: "DeviceRegistrationRequests",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_ApprovedDeviceId",
                table: "DeviceRegistrationRequests",
                column: "ApprovedDeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_HardwareProcessed",
                table: "DeviceRegistrationRequests",
                column: "HardwareProcessed");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_HasHardwareInfo",
                table: "DeviceRegistrationRequests",
                column: "HasHardwareInfo");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_MacAddress",
                table: "DeviceRegistrationRequests",
                column: "MacAddress");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_MatchedUserId",
                table: "DeviceRegistrationRequests",
                column: "MatchedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Method",
                table: "DeviceRegistrationRequests",
                column: "Method");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Pin",
                table: "DeviceRegistrationRequests",
                column: "Pin");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_RegistrationId",
                table: "DeviceRegistrationRequests",
                column: "RegistrationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_RequestedUsername",
                table: "DeviceRegistrationRequests",
                column: "RequestedUsername");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Status",
                table: "DeviceRegistrationRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Status_CreatedAt",
                table: "DeviceRegistrationRequests",
                columns: new[] { "Status", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_Device_CreatedAt",
                table: "Devices",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Device_UpdatedAt",
                table: "Devices",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_AssignedUserId",
                table: "Devices",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_DeactivatedBy",
                table: "Devices",
                column: "DeactivatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_DeviceGroupId",
                table: "Devices",
                column: "DeviceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_DeviceKey",
                table: "Devices",
                column: "DeviceKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Devices_MacAddress",
                table: "Devices",
                column: "MacAddress",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Devices_ManagedByUserId",
                table: "Devices",
                column: "ManagedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceStatusLog_CreatedAt",
                table: "DeviceStatusLogs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceStatusLog_UpdatedAt",
                table: "DeviceStatusLogs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceStatusLogs_DeviceId_Timestamp",
                table: "DeviceStatusLogs",
                columns: new[] { "DeviceId", "Timestamp" });

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

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResults_Status",
                table: "HealthCheckResults",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Media_CreatedAt",
                table: "Medias",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Media_UpdatedAt",
                table: "Medias",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Medias_OriginalKey",
                table: "Medias",
                column: "OriginalKey");

            migrationBuilder.CreateIndex(
                name: "IX_Medias_S3Key",
                table: "Medias",
                column: "S3Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Medias_Status",
                table: "Medias",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Medias_Type",
                table: "Medias",
                column: "Type");

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
                name: "IX_MediaVariants_MediaId_VariantType",
                table: "MediaVariants",
                columns: new[] { "MediaId", "VariantType" });

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_Quality",
                table: "MediaVariants",
                column: "Quality");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_Width_Height",
                table: "MediaVariants",
                columns: new[] { "Width", "Height" });

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLog_UpdatedAt",
                table: "PermissionAuditLogs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_Action",
                table: "PermissionAuditLogs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_CreatedAt",
                table: "PermissionAuditLogs",
                column: "created_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_CreatedBy",
                table: "PermissionAuditLogs",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_DeviceGroupId",
                table: "PermissionAuditLogs",
                column: "DeviceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_UserId",
                table: "PermissionAuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_UserId_CreatedAt",
                table: "PermissionAuditLogs",
                columns: new[] { "UserId", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackState_CreatedAt",
                table: "PlaybackStates",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackState_UpdatedAt",
                table: "PlaybackStates",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackStates_DeviceId_PlaylistId",
                table: "PlaybackStates",
                columns: new[] { "DeviceId", "PlaylistId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackStates_IsSynced",
                table: "PlaybackStates",
                column: "IsSynced");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackStates_PlaylistId",
                table: "PlaybackStates",
                column: "PlaylistId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackStates_Status",
                table: "PlaybackStates",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignment_CreatedAt",
                table: "PlaylistAssignments",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignment_UpdatedAt",
                table: "PlaylistAssignments",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignments_AssignedByUserId",
                table: "PlaylistAssignments",
                column: "AssignedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignments_DeviceGroupId",
                table: "PlaylistAssignments",
                column: "DeviceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignments_DeviceId",
                table: "PlaylistAssignments",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignments_end_date",
                table: "PlaylistAssignments",
                column: "end_date");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignments_IsActive",
                table: "PlaylistAssignments",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignments_PlaylistId_DeviceGroupId",
                table: "PlaylistAssignments",
                columns: new[] { "PlaylistId", "DeviceGroupId" });

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignments_PlaylistId_DeviceId",
                table: "PlaylistAssignments",
                columns: new[] { "PlaylistId", "DeviceId" });

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignments_Priority",
                table: "PlaylistAssignments",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignments_start_date",
                table: "PlaylistAssignments",
                column: "start_date");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistItem_CreatedAt",
                table: "PlaylistItems",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistItem_UpdatedAt",
                table: "PlaylistItems",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistItems_MediaId",
                table: "PlaylistItems",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistItems_PlaylistId_OrderIndex",
                table: "PlaylistItems",
                columns: new[] { "PlaylistId", "OrderIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Playlist_CreatedAt",
                table: "Playlists",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Playlist_UpdatedAt",
                table: "Playlists",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Playlists_CreatedByUserId",
                table: "Playlists",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Playlists_Name",
                table: "Playlists",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Playlists_Status",
                table: "Playlists",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_CreatedAt",
                table: "RefreshTokens",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UpdatedAt",
                table: "RefreshTokens",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_DeviceId",
                table: "RefreshTokens",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_TokenValue",
                table: "RefreshTokens",
                column: "TokenValue",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLog_CreatedAt",
                table: "RegistrationAuditLogs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLog_UpdatedAt",
                table: "RegistrationAuditLogs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_Action",
                table: "RegistrationAuditLogs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_DeviceRegistrationRequestId",
                table: "RegistrationAuditLogs",
                column: "DeviceRegistrationRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_Result",
                table: "RegistrationAuditLogs",
                column: "Result");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLogs_UserId",
                table: "RegistrationAuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecord_CreatedAt",
                table: "RegistrationRecords",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecord_UpdatedAt",
                table: "RegistrationRecords",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecords_DeviceId_Timestamp",
                table: "RegistrationRecords",
                columns: new[] { "DeviceId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecords_UserId",
                table: "RegistrationRecords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SceneItem_CreatedAt",
                table: "SceneItems",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_SceneItem_UpdatedAt",
                table: "SceneItems",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_SceneItems_MediaId",
                table: "SceneItems",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_SceneItems_SceneId_ZIndex",
                table: "SceneItems",
                columns: new[] { "SceneId", "ZIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_Scene_CreatedAt",
                table: "Scenes",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Scene_UpdatedAt",
                table: "Scenes",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_BackgroundImageId",
                table: "Scenes",
                column: "BackgroundImageId");

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_CreatedByUserId",
                table: "Scenes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_IsTemplate",
                table: "Scenes",
                column: "IsTemplate");

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_LayoutType",
                table: "Scenes",
                column: "LayoutType");

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_Name",
                table: "Scenes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_TemplateName",
                table: "Scenes",
                column: "TemplateName");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleMedia_CreatedAt",
                table: "ScheduleMedias",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleMedia_UpdatedAt",
                table: "ScheduleMedias",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleMedias_MediaId",
                table: "ScheduleMedias",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleMedias_ScheduleId_Order",
                table: "ScheduleMedias",
                columns: new[] { "ScheduleId", "Order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_CreatedAt",
                table: "Schedules",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_UpdatedAt",
                table: "Schedules",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_DeviceId",
                table: "Schedules",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_IsDefault",
                table: "Schedules",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstance_CreatedAt",
                table: "ServiceInstances",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstance_UpdatedAt",
                table: "ServiceInstances",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_EndpointUrl",
                table: "ServiceInstances",
                column: "EndpointUrl");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_IsActive",
                table: "ServiceInstances",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstances_last_seen",
                table: "ServiceInstances",
                column: "last_seen");

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
                name: "IX_Service_CreatedAt",
                table: "Services",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Service_UpdatedAt",
                table: "Services",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Services_IsActive",
                table: "Services",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Services_last_heartbeat",
                table: "Services",
                column: "last_heartbeat");

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
                name: "IX_Services_Status",
                table: "Services",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Services_Type",
                table: "Services",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociation_CreatedAt",
                table: "UserDeviceAssociations",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociation_UpdatedAt",
                table: "UserDeviceAssociations",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociations_AssociationType",
                table: "UserDeviceAssociations",
                column: "AssociationType");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociations_DeviceId",
                table: "UserDeviceAssociations",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociations_UserId",
                table: "UserDeviceAssociations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociations_UserId_DeviceId",
                table: "UserDeviceAssociations",
                columns: new[] { "UserId", "DeviceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermission_CreatedAt",
                table: "UserDeviceGroupPermissions",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermission_UpdatedAt",
                table: "UserDeviceGroupPermissions",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermissions_created_by",
                table: "UserDeviceGroupPermissions",
                column: "created_by");

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

            migrationBuilder.CreateIndex(
                name: "IX_User_CreatedAt",
                table: "Users",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_User_UpdatedAt",
                table: "Users",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedule_CreatedAt",
                table: "UserSchedules",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedule_UpdatedAt",
                table: "UserSchedules",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_AssignedByUserId",
                table: "UserSchedules",
                column: "AssignedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_ScheduleId",
                table: "UserSchedules",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_UserId",
                table: "UserSchedules",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_UserId_ScheduleId",
                table: "UserSchedules",
                columns: new[] { "UserId", "ScheduleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_ConnectionId",
                table: "WebSocketConnectionLogs",
                column: "ConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_CreatedAt",
                table: "WebSocketConnectionLogs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_UpdatedAt",
                table: "WebSocketConnectionLogs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_UserId_DisconnectedAt",
                table: "WebSocketConnectionLogs",
                columns: new[] { "UserId", "disconnected_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "device_group_audit_logs");

            migrationBuilder.DropTable(
                name: "DeviceApprovals");

            migrationBuilder.DropTable(
                name: "DeviceCapabilities");

            migrationBuilder.DropTable(
                name: "DeviceConfigurations");

            migrationBuilder.DropTable(
                name: "DeviceStatusLogs");

            migrationBuilder.DropTable(
                name: "HardwareDetectionJobs");

            migrationBuilder.DropTable(
                name: "HealthCheckResults");

            migrationBuilder.DropTable(
                name: "MediaVariants");

            migrationBuilder.DropTable(
                name: "PermissionAuditLogs");

            migrationBuilder.DropTable(
                name: "PlaybackStates");

            migrationBuilder.DropTable(
                name: "PlaylistAssignments");

            migrationBuilder.DropTable(
                name: "PlaylistItems");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "RegistrationAuditLogs");

            migrationBuilder.DropTable(
                name: "RegistrationRecords");

            migrationBuilder.DropTable(
                name: "SceneItems");

            migrationBuilder.DropTable(
                name: "ScheduleMedias");

            migrationBuilder.DropTable(
                name: "UserDeviceAssociations");

            migrationBuilder.DropTable(
                name: "UserDeviceGroupPermissions");

            migrationBuilder.DropTable(
                name: "UserSchedules");

            migrationBuilder.DropTable(
                name: "WebSocketConnectionLogs");

            migrationBuilder.DropTable(
                name: "DeviceHardwareProfiles");

            migrationBuilder.DropTable(
                name: "ServiceInstances");

            migrationBuilder.DropTable(
                name: "Playlists");

            migrationBuilder.DropTable(
                name: "DeviceRegistrationRequests");

            migrationBuilder.DropTable(
                name: "Scenes");

            migrationBuilder.DropTable(
                name: "Schedules");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "Medias");

            migrationBuilder.DropTable(
                name: "Devices");

            migrationBuilder.DropTable(
                name: "DeviceGroups");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
