using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreatePostgreSQLSnakeCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "medias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    file_name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    s3_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    mime_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    duration_seconds = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    original_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    processing_error = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    processed_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    original_width = table.Column<int>(type: "integer", nullable: true),
                    original_height = table.Column<int>(type: "integer", nullable: true),
                    original_bitrate = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "qr_codes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    scans = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    last_scanned = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "active"),
                    expiry_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    device_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    device_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    image_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_qr_codes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "schedules",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    recurrence_pattern = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    is_default = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false, comment: "Marks this schedule as a fallback when user has no assigned schedules"),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 5, comment: "Priority level 1-10 for schedule conflict resolution, higher = more important"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_schedules", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "services",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    base_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    health_check_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    type = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    tags = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    metadata = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    last_heartbeat = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    last_health_check = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    consecutive_health_check_failures = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_services", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    last_login_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    failed_login_attempts = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    lockout_until = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "media_variants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    media_id = table.Column<int>(type: "integer", nullable: false),
                    width = table.Column<int>(type: "integer", nullable: false),
                    height = table.Column<int>(type: "integer", nullable: false),
                    variant_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    quality = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    bitrate = table.Column<int>(type: "integer", nullable: true),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    etag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    quality_score = table.Column<double>(type: "double precision", nullable: true),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    format = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    s3_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    cloudfront_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    target_resolution = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_original = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_media_variants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_media_variants_medias_media_id",
                        column: x => x.media_id,
                        principalTable: "medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "schedule_medias",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    order = table.Column<int>(type: "integer", nullable: false),
                    duration_seconds = table.Column<int>(type: "integer", nullable: false),
                    schedule_id = table.Column<int>(type: "integer", nullable: false),
                    media_id = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_schedule_medias", x => x.id);
                    table.ForeignKey(
                        name: "FK_schedule_medias_medias_media_id",
                        column: x => x.media_id,
                        principalTable: "medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_schedule_medias_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "schedules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "service_instances",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    service_id = table.Column<int>(type: "integer", nullable: false),
                    instance_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    endpoint_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    Port = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    instance_metadata = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    last_seen = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    deregistered_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    health_check_interval_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    health_check_timeout_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                    max_consecutive_failures = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service_instances", x => x.id);
                    table.ForeignKey(
                        name: "FK_service_instances_services_service_id",
                        column: x => x.service_id,
                        principalTable: "services",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "device_groups",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false, defaultValue: ""),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    parent_group_id = table.Column<int>(type: "integer", nullable: true),
                    path = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false, defaultValue: ""),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_groups", x => x.id);
                    table.ForeignKey(
                        name: "FK_device_groups_device_groups_parent_group_id",
                        column: x => x.parent_group_id,
                        principalTable: "device_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_device_groups_users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "playlists",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    is_looped = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LoopCount = table.Column<int>(type: "integer", nullable: true),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_by_user_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_playlists", x => x.id);
                    table.ForeignKey(
                        name: "FK_playlists_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "scenes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    layout_type = table.Column<int>(type: "integer", nullable: false),
                    width = table.Column<int>(type: "integer", nullable: false, defaultValue: 1920),
                    height = table.Column<int>(type: "integer", nullable: false, defaultValue: 1080),
                    background_color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    background_image_id = table.Column<int>(type: "integer", nullable: true),
                    is_template = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    template_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_by_user_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scenes", x => x.id);
                    table.ForeignKey(
                        name: "FK_scenes_medias_background_image_id",
                        column: x => x.background_image_id,
                        principalTable: "medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_scenes_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "user_schedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    schedule_id = table.Column<int>(type: "integer", nullable: false),
                    assigned_by_user_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_schedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_schedules_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "schedules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_schedules_users_assigned_by_user_id",
                        column: x => x.assigned_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_user_schedules_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "web_socket_connection_logs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    connection_id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    disconnected_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    user_agent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    disconnection_reason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_web_socket_connection_logs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_web_socket_connection_logs_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "health_check_results",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    service_id = table.Column<int>(type: "integer", nullable: false),
                    service_instance_id = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    response_time_ms = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    response_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    error_message = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    additional_data = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_health_check_results", x => x.id);
                    table.ForeignKey(
                        name: "FK_health_check_results_service_instances_service_instance_id",
                        column: x => x.service_instance_id,
                        principalTable: "service_instances",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_health_check_results_services_service_id",
                        column: x => x.service_id,
                        principalTable: "services",
                        principalColumn: "id",
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
                        principalTable: "device_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_device_group_audit_logs_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "devices",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    device_key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    location = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    device_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    resolution = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    last_heartbeat = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    last_seen_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    mac_address = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: false),
                    android_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    api_level = table.Column<int>(type: "integer", nullable: true),
                    serial_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    manufacturer = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    display_resolution = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    deactivated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    deactivated_by = table.Column<int>(type: "integer", nullable: true),
                    managed_by_user_id = table.Column<int>(type: "integer", nullable: true),
                    device_group_id = table.Column<int>(type: "integer", nullable: true),
                    assigned_user_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_devices", x => x.id);
                    table.ForeignKey(
                        name: "FK_devices_device_groups_device_group_id",
                        column: x => x.device_group_id,
                        principalTable: "device_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_devices_users_assigned_user_id",
                        column: x => x.assigned_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_devices_users_deactivated_by",
                        column: x => x.deactivated_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_devices_users_managed_by_user_id",
                        column: x => x.managed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "permission_audit_logs",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    device_group_id = table.Column<int>(type: "integer", nullable: false),
                    previous_permission = table.Column<int>(type: "integer", nullable: true, comment: "Permission level before change (null for new permissions)"),
                    new_permission = table.Column<int>(type: "integer", nullable: true, comment: "Permission level after change (null for deleted permissions)"),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, comment: "Action type: GRANTED, MODIFIED, REVOKED"),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true, comment: "Admin-provided reason for the permission change"),
                    context = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true, comment: "Additional context (IP address, user agent, etc.)"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permission_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_PermissionAuditLogs_DeviceGroups_DeviceGroupId",
                        column: x => x.device_group_id,
                        principalTable: "device_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PermissionAuditLogs_Users_CreatedBy",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PermissionAuditLogs_Users_UserId",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "user_device_group_permissions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    device_group_id = table.Column<int>(type: "integer", nullable: false),
                    permission = table.Column<int>(type: "integer", nullable: false, comment: "UserPermissionLevel enum: 0=NoAccess, 1=ViewOnly, 2=ManageContent, 3=FullControl"),
                    is_explicit = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true, comment: "True if explicitly assigned, False if inherited from parent group"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_device_group_permissions", x => x.id);
                    table.CheckConstraint("ck_user_device_group_permissions_permission", "permission >= 0 AND permission <= 3");
                    table.ForeignKey(
                        name: "fk_user_device_group_permissions_device_groups_device_group_id",
                        column: x => x.device_group_id,
                        principalTable: "device_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_device_group_permissions_users_created_by",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_user_device_group_permissions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "playlist_items",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    playlist_id = table.Column<int>(type: "integer", nullable: false),
                    media_id = table.Column<int>(type: "integer", nullable: false),
                    order_index = table.Column<int>(type: "integer", nullable: false),
                    duration_seconds = table.Column<int>(type: "integer", nullable: false),
                    use_custom_duration = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    transition_effect = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    transition_duration_ms = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_conditional = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_playlist_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_playlist_items_medias_media_id",
                        column: x => x.media_id,
                        principalTable: "medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_playlist_items_playlists_playlist_id",
                        column: x => x.playlist_id,
                        principalTable: "playlists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "scene_items",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    scene_id = table.Column<int>(type: "integer", nullable: false),
                    media_id = table.Column<int>(type: "integer", nullable: false),
                    x = table.Column<int>(type: "integer", nullable: false),
                    y = table.Column<int>(type: "integer", nullable: false),
                    width = table.Column<int>(type: "integer", nullable: false),
                    height = table.Column<int>(type: "integer", nullable: false),
                    z_index = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    opacity = table.Column<float>(type: "real", precision: 3, scale: 2, nullable: false, defaultValue: 1f),
                    rotation = table.Column<float>(type: "real", precision: 5, scale: 2, nullable: false, defaultValue: 0f),
                    animation_in = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    animation_out = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    animation_duration = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    duration_seconds = table.Column<int>(type: "integer", nullable: false),
                    use_custom_duration = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scene_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_scene_items_medias_media_id",
                        column: x => x.media_id,
                        principalTable: "medias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_scene_items_scenes_scene_id",
                        column: x => x.scene_id,
                        principalTable: "scenes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    assignment_type = table.Column<int>(type: "integer", nullable: false),
                    content_id = table.Column<int>(type: "integer", nullable: false),
                    target_type = table.Column<int>(type: "integer", nullable: false),
                    target_id = table.Column<int>(type: "integer", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                    start_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    start_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    end_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    is_recurring = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    recurrence_pattern = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    days_of_week = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_emergency_broadcast = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    emergency_expires_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_by_user_id = table.Column<int>(type: "integer", nullable: false),
                    last_modified_by_user_id = table.Column<int>(type: "integer", nullable: true),
                    DeviceGroupId = table.Column<int>(type: "integer", nullable: true),
                    DeviceId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assignments", x => x.Id);
                    table.CheckConstraint("CK_Assignment_Emergency_Expiry", "is_emergency_broadcast = false OR emergency_expires_at IS NOT NULL");
                    table.CheckConstraint("CK_Assignment_EndDate_After_StartDate", "end_date IS NULL OR end_date >= start_date");
                    table.CheckConstraint("CK_Assignment_Priority_Range", "priority >= 1 AND priority <= 10");
                    table.CheckConstraint("CK_Assignment_Time_Window", "start_time IS NULL OR end_time IS NULL OR start_time != end_time");
                    table.ForeignKey(
                        name: "FK_assignments_device_groups_DeviceGroupId",
                        column: x => x.DeviceGroupId,
                        principalTable: "device_groups",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_assignments_devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "devices",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_assignments_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_assignments_users_last_modified_by_user_id",
                        column: x => x.last_modified_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "device_capabilities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    max_width = table.Column<int>(type: "integer", nullable: false, defaultValue: 1920),
                    max_height = table.Column<int>(type: "integer", nullable: false, defaultValue: 1080),
                    max_bitrate = table.Column<int>(type: "integer", nullable: false, defaultValue: 5000),
                    supported_formats = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[\"mp4\",\"jpg\",\"webp\"]"),
                    network_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "wifi"),
                    bandwidth_kbps = table.Column<int>(type: "integer", nullable: false, defaultValue: 10000),
                    cpu_score = table.Column<int>(type: "integer", nullable: false, defaultValue: 50),
                    ram_mb = table.Column<int>(type: "integer", nullable: false, defaultValue: 2048),
                    storage_mb = table.Column<int>(type: "integer", nullable: false, defaultValue: 8192),
                    last_updated = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_capabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_device_capabilities_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "device_configurations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    display_orientation = table.Column<int>(type: "integer", nullable: false),
                    resolution = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    refresh_rate = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                    screen_timeout = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    power_management = table.Column<int>(type: "integer", nullable: false),
                    network_config = table.Column<string>(type: "text", nullable: true),
                    app_permissions = table.Column<string>(type: "text", nullable: true),
                    remote_management_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    proxy_settings = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_configurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_device_configurations_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_device_configurations_users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "device_hardware_profiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    display_width = table.Column<int>(type: "integer", nullable: false),
                    display_height = table.Column<int>(type: "integer", nullable: false),
                    refresh_rate = table.Column<float>(type: "real", precision: 5, scale: 2, nullable: false),
                    physical_width = table.Column<float>(type: "real", precision: 6, scale: 2, nullable: false),
                    physical_height = table.Column<float>(type: "real", precision: 6, scale: 2, nullable: false),
                    density_dpi = table.Column<int>(type: "integer", nullable: false),
                    manufacturer = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    android_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    api_level = table.Column<int>(type: "integer", nullable: false),
                    build_fingerprint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    supported_formats = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    codec_capabilities = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    additional_specs = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    detected_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    IsAutoDetected = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DetectionSource = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true, defaultValue: "system"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_hardware_profiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_device_hardware_profiles_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "device_registration_requests",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    registration_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    mac_address = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: false),
                    pin = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    device_model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    manufacturer = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    android_version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    app_version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    network_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    hardware_specs = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    hardware_info = table.Column<string>(type: "jsonb", maxLength: 2000, nullable: true, comment: "Enhanced hardware information JSON payload from device"),
                    has_hardware_info = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false, comment: "Flag indicating whether enhanced hardware information was provided"),
                    hardware_processed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false, comment: "Flag indicating whether hardware information has been processed"),
                    hardware_processed_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true, comment: "Timestamp when hardware information was processed"),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    method = table.Column<int>(type: "integer", nullable: false),
                    qr_code_data = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    requested_username = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false, comment: "Email or username provided by device during registration"),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, comment: "Email address provided by device for automatic user creation"),
                    requested_user_display_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true, comment: "Optional friendly name provided by device"),
                    MatchedUserId = table.Column<int>(type: "integer", nullable: true),
                    CreatedUserId = table.Column<int>(type: "integer", nullable: true),
                    expires_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    last_polled_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ApprovedDeviceId = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_registration_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_device_registration_requests_devices_ApprovedDeviceId",
                        column: x => x.ApprovedDeviceId,
                        principalTable: "devices",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_device_registration_requests_users_CreatedUserId",
                        column: x => x.CreatedUserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_device_registration_requests_users_MatchedUserId",
                        column: x => x.MatchedUserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "device_status_logs",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    details = table.Column<string>(type: "text", nullable: true),
                    timestamp = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_status_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_device_status_logs_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "playback_states",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    playlist_id = table.Column<int>(type: "integer", nullable: false),
                    current_item_index = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_position_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    total_duration_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_loop_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    TotalLoops = table.Column<int>(type: "integer", nullable: true),
                    is_looping = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    estimated_end_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    error_message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    error_occurred_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    is_synced = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    last_sync_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    sync_token = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_playback_states", x => x.id);
                    table.ForeignKey(
                        name: "FK_playback_states_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_playback_states_playlists_playlist_id",
                        column: x => x.playlist_id,
                        principalTable: "playlists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "playlist_assignments",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    playlist_id = table.Column<int>(type: "integer", nullable: false),
                    device_id = table.Column<int>(type: "integer", nullable: true),
                    device_group_id = table.Column<int>(type: "integer", nullable: true),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    start_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    start_time = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    end_time = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_recurring = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    recurrence_pattern = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    days_of_week = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    assigned_by_user_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_playlist_assignments", x => x.id);
                    table.CheckConstraint("ck_playlist_assignment_device_or_group", "(device_id IS NOT NULL AND device_group_id IS NULL) OR (device_id IS NULL AND device_group_id IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_playlist_assignments_device_groups_device_group_id",
                        column: x => x.device_group_id,
                        principalTable: "device_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_playlist_assignments_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_playlist_assignments_playlists_playlist_id",
                        column: x => x.playlist_id,
                        principalTable: "playlists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_playlist_assignments_users_assigned_by_user_id",
                        column: x => x.assigned_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    token_value = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    device_id = table.Column<int>(type: "integer", nullable: true),
                    is_revoked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    expires_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    revoked_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    replaced_by_token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_by_ip = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "FK_refresh_tokens_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_refresh_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "registration_records",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    action = table.Column<int>(type: "integer", nullable: false),
                    details = table.Column<string>(type: "text", nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    timestamp = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    success = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_registration_records", x => x.id);
                    table.ForeignKey(
                        name: "FK_registration_records_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_registration_records_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "schedule_devices",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    schedule_id = table.Column<int>(type: "integer", nullable: false),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    device_priority = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_schedule_devices", x => x.id);
                    table.ForeignKey(
                        name: "FK_schedule_devices_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_schedule_devices_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "schedules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_device_associations",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    associated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    association_type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_device_associations", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_device_associations_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_device_associations_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assignment_histories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    assignment_id = table.Column<int>(type: "integer", nullable: false),
                    action = table.Column<int>(type: "integer", nullable: false),
                    previous_values = table.Column<string>(type: "text", nullable: true),
                    new_values = table.Column<string>(type: "text", nullable: true),
                    reason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    action_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assignment_histories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_assignment_histories_assignments_assignment_id",
                        column: x => x.assignment_id,
                        principalTable: "assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_assignment_histories_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "device_approvals",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_registration_request_id = table.Column<int>(type: "integer", nullable: false),
                    approved_by_user_id = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    device_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    device_group_id = table.Column<int>(type: "integer", nullable: true),
                    zone_id = table.Column<int>(type: "integer", nullable: true),
                    initial_schedule_id = table.Column<int>(type: "integer", nullable: true),
                    tags = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    device_key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_approvals", x => x.id);
                    table.ForeignKey(
                        name: "FK_device_approvals_device_groups_device_group_id",
                        column: x => x.device_group_id,
                        principalTable: "device_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_device_approvals_device_registration_requests_device_regist~",
                        column: x => x.device_registration_request_id,
                        principalTable: "device_registration_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_device_approvals_schedules_initial_schedule_id",
                        column: x => x.initial_schedule_id,
                        principalTable: "schedules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_device_approvals_users_approved_by_user_id",
                        column: x => x.approved_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "hardware_detection_jobs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_registration_request_id = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    started_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    completed_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    retry_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    profile_created = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    device_hardware_profile_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hardware_detection_jobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_hardware_detection_jobs_device_hardware_profiles_device_har~",
                        column: x => x.device_hardware_profile_id,
                        principalTable: "device_hardware_profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_hardware_detection_jobs_device_registration_requests_device~",
                        column: x => x.device_registration_request_id,
                        principalTable: "device_registration_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "registration_audit_logs",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_registration_request_id = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: true),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    details = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    result = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_registration_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_registration_audit_logs_device_registration_requests_device~",
                        column: x => x.device_registration_request_id,
                        principalTable: "device_registration_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_registration_audit_logs_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentHistory_Action",
                table: "assignment_histories",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentHistory_Action_Date",
                table: "assignment_histories",
                columns: new[] { "action", "action_date" });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentHistory_ActionDate",
                table: "assignment_histories",
                column: "action_date");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentHistory_Assignment_Date",
                table: "assignment_histories",
                columns: new[] { "assignment_id", "action_date" });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentHistory_AssignmentId",
                table: "assignment_histories",
                column: "assignment_id");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentHistory_CreatedAt",
                table: "assignment_histories",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentHistory_UpdatedAt",
                table: "assignment_histories",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentHistory_User_Date",
                table: "assignment_histories",
                columns: new[] { "user_id", "action_date" });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentHistory_UserId",
                table: "assignment_histories",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_AssignmentType",
                table: "assignments",
                column: "assignment_type");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_ContentId",
                table: "assignments",
                column: "content_id");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_CreatedAt",
                table: "assignments",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Emergency_Status_Priority",
                table: "assignments",
                columns: new[] { "is_emergency_broadcast", "status", "priority" });

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_EmergencyExpiresAt",
                table: "assignments",
                column: "emergency_expires_at");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_EndDate",
                table: "assignments",
                column: "end_date");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_IsEmergencyBroadcast",
                table: "assignments",
                column: "is_emergency_broadcast");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Priority",
                table: "assignments",
                column: "priority");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_StartDate",
                table: "assignments",
                column: "start_date");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Status",
                table: "assignments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Status_DateRange",
                table: "assignments",
                columns: new[] { "status", "start_date", "end_date" });

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Target",
                table: "assignments",
                columns: new[] { "target_type", "target_id" });

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Target_Priority",
                table: "assignments",
                columns: new[] { "target_type", "target_id", "priority" });

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_UpdatedAt",
                table: "assignments",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_created_by_user_id",
                table: "assignments",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_DeviceGroupId",
                table: "assignments",
                column: "DeviceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_DeviceId",
                table: "assignments",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_last_modified_by_user_id",
                table: "assignments",
                column: "last_modified_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_device_approvals_approved_by_user_id",
                table: "device_approvals",
                column: "approved_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_device_approvals_device_group_id",
                table: "device_approvals",
                column: "device_group_id");

            migrationBuilder.CreateIndex(
                name: "IX_device_approvals_device_key",
                table: "device_approvals",
                column: "device_key");

            migrationBuilder.CreateIndex(
                name: "IX_device_approvals_device_registration_request_id",
                table: "device_approvals",
                column: "device_registration_request_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_device_approvals_initial_schedule_id",
                table: "device_approvals",
                column: "initial_schedule_id");

            migrationBuilder.CreateIndex(
                name: "IX_device_approvals_status",
                table: "device_approvals",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApproval_CreatedAt",
                table: "device_approvals",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceApproval_UpdatedAt",
                table: "device_approvals",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapabilities_DeviceId",
                table: "device_capabilities",
                column: "device_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapabilities_NetworkType",
                table: "device_capabilities",
                column: "network_type");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapabilities_Resolution",
                table: "device_capabilities",
                columns: new[] { "max_width", "max_height" });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapability_CreatedAt",
                table: "device_capabilities",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceCapability_UpdatedAt",
                table: "device_capabilities",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_device_configurations_device_id",
                table: "device_configurations",
                column: "device_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_device_configurations_UpdatedBy",
                table: "device_configurations",
                column: "UpdatedBy");

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
                name: "IX_device_groups_CreatedByUserId",
                table: "device_groups",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroup_CreatedAt",
                table: "device_groups",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroup_UpdatedAt",
                table: "device_groups",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_IsActive",
                table: "device_groups",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_Name",
                table: "device_groups",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_ParentGroupId",
                table: "device_groups",
                column: "parent_group_id");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_ParentGroupId_Name",
                table: "device_groups",
                columns: new[] { "parent_group_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfile_CreatedAt",
                table: "device_hardware_profiles",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfile_UpdatedAt",
                table: "device_hardware_profiles",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfiles_DetectedAt",
                table: "device_hardware_profiles",
                column: "detected_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfiles_DeviceId",
                table: "device_hardware_profiles",
                column: "device_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfiles_Manufacturer",
                table: "device_hardware_profiles",
                column: "manufacturer");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceHardwareProfiles_Model",
                table: "device_hardware_profiles",
                column: "model");

            migrationBuilder.CreateIndex(
                name: "IX_device_registration_requests_ApprovedDeviceId",
                table: "device_registration_requests",
                column: "ApprovedDeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_device_registration_requests_CreatedUserId",
                table: "device_registration_requests",
                column: "CreatedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_device_registration_requests_mac_address",
                table: "device_registration_requests",
                column: "mac_address");

            migrationBuilder.CreateIndex(
                name: "IX_device_registration_requests_MatchedUserId",
                table: "device_registration_requests",
                column: "MatchedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_device_registration_requests_method",
                table: "device_registration_requests",
                column: "method");

            migrationBuilder.CreateIndex(
                name: "IX_device_registration_requests_pin",
                table: "device_registration_requests",
                column: "pin");

            migrationBuilder.CreateIndex(
                name: "IX_device_registration_requests_registration_id",
                table: "device_registration_requests",
                column: "registration_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_device_registration_requests_status",
                table: "device_registration_requests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequest_CreatedAt",
                table: "device_registration_requests",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequest_UpdatedAt",
                table: "device_registration_requests",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Email",
                table: "device_registration_requests",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_HardwareProcessed",
                table: "device_registration_requests",
                column: "hardware_processed");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_HasHardwareInfo",
                table: "device_registration_requests",
                column: "has_hardware_info");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_RequestedUsername",
                table: "device_registration_requests",
                column: "requested_username");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrationRequests_Status_CreatedAt",
                table: "device_registration_requests",
                columns: new[] { "status", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_device_status_logs_device_id_timestamp",
                table: "device_status_logs",
                columns: new[] { "device_id", "timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceStatusLog_CreatedAt",
                table: "device_status_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceStatusLog_UpdatedAt",
                table: "device_status_logs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Device_CreatedAt",
                table: "devices",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Device_UpdatedAt",
                table: "devices",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_AssignedUserId",
                table: "devices",
                column: "assigned_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_devices_deactivated_by",
                table: "devices",
                column: "deactivated_by");

            migrationBuilder.CreateIndex(
                name: "IX_devices_device_group_id",
                table: "devices",
                column: "device_group_id");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_DeviceKey",
                table: "devices",
                column: "device_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Devices_MacAddress",
                table: "devices",
                column: "mac_address",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_devices_managed_by_user_id",
                table: "devices",
                column: "managed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_hardware_detection_jobs_device_hardware_profile_id",
                table: "hardware_detection_jobs",
                column: "device_hardware_profile_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJob_CreatedAt",
                table: "hardware_detection_jobs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJob_UpdatedAt",
                table: "hardware_detection_jobs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_DeviceRegistrationRequestId",
                table: "hardware_detection_jobs",
                column: "device_registration_request_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_ProfileCreated",
                table: "hardware_detection_jobs",
                column: "profile_created");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_RetryCount",
                table: "hardware_detection_jobs",
                column: "retry_count");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_StartedAt",
                table: "hardware_detection_jobs",
                column: "started_at");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_Status",
                table: "hardware_detection_jobs",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareDetectionJobs_Status_StartedAt",
                table: "hardware_detection_jobs",
                columns: new[] { "status", "started_at" });

            migrationBuilder.CreateIndex(
                name: "ix_health_check_results_service_id_created_at",
                table: "health_check_results",
                columns: new[] { "service_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_health_check_results_service_instance_id_created_at",
                table: "health_check_results",
                columns: new[] { "service_instance_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_health_check_results_status",
                table: "health_check_results",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResult_CreatedAt",
                table: "health_check_results",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckResult_UpdatedAt",
                table: "health_check_results",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariant_CreatedAt",
                table: "media_variants",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariant_UpdatedAt",
                table: "media_variants",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_IsOriginal",
                table: "media_variants",
                column: "is_original");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_MediaId",
                table: "media_variants",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_MediaId_TargetResolution",
                table: "media_variants",
                columns: new[] { "media_id", "target_resolution" });

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_MediaId_VariantType",
                table: "media_variants",
                columns: new[] { "media_id", "variant_type" });

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_Quality",
                table: "media_variants",
                column: "quality");

            migrationBuilder.CreateIndex(
                name: "IX_MediaVariants_Width_Height",
                table: "media_variants",
                columns: new[] { "width", "height" });

            migrationBuilder.CreateIndex(
                name: "IX_Media_CreatedAt",
                table: "medias",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Media_UpdatedAt",
                table: "medias",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_medias_original_key",
                table: "medias",
                column: "original_key");

            migrationBuilder.CreateIndex(
                name: "IX_medias_s3_key",
                table: "medias",
                column: "s3_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_medias_status",
                table: "medias",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_medias_type",
                table: "medias",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "ix_permission_audit_logs_action",
                table: "permission_audit_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "ix_permission_audit_logs_created_at",
                table: "permission_audit_logs",
                column: "created_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "ix_permission_audit_logs_created_by",
                table: "permission_audit_logs",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_permission_audit_logs_device_group_id",
                table: "permission_audit_logs",
                column: "device_group_id");

            migrationBuilder.CreateIndex(
                name: "ix_permission_audit_logs_user_id",
                table: "permission_audit_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_permission_audit_logs_user_id_created_at",
                table: "permission_audit_logs",
                columns: new[] { "user_id", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLog_UpdatedAt",
                table: "permission_audit_logs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_playback_states_device_id_playlist_id",
                table: "playback_states",
                columns: new[] { "device_id", "playlist_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_playback_states_is_synced",
                table: "playback_states",
                column: "is_synced");

            migrationBuilder.CreateIndex(
                name: "IX_playback_states_playlist_id",
                table: "playback_states",
                column: "playlist_id");

            migrationBuilder.CreateIndex(
                name: "IX_playback_states_status",
                table: "playback_states",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackState_CreatedAt",
                table: "playback_states",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackState_UpdatedAt",
                table: "playback_states",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_assignments_assigned_by_user_id",
                table: "playlist_assignments",
                column: "assigned_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_assignments_device_group_id",
                table: "playlist_assignments",
                column: "device_group_id");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_assignments_device_id",
                table: "playlist_assignments",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "ix_playlist_assignments_end_date",
                table: "playlist_assignments",
                column: "end_date");

            migrationBuilder.CreateIndex(
                name: "ix_playlist_assignments_is_active",
                table: "playlist_assignments",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_playlist_assignments_playlist_id_device_group_id",
                table: "playlist_assignments",
                columns: new[] { "playlist_id", "device_group_id" });

            migrationBuilder.CreateIndex(
                name: "ix_playlist_assignments_playlist_id_device_id",
                table: "playlist_assignments",
                columns: new[] { "playlist_id", "device_id" });

            migrationBuilder.CreateIndex(
                name: "ix_playlist_assignments_priority",
                table: "playlist_assignments",
                column: "priority");

            migrationBuilder.CreateIndex(
                name: "ix_playlist_assignments_start_date",
                table: "playlist_assignments",
                column: "start_date");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignment_CreatedAt",
                table: "playlist_assignments",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAssignment_UpdatedAt",
                table: "playlist_assignments",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_items_media_id",
                table: "playlist_items",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_items_playlist_id_order_index",
                table: "playlist_items",
                columns: new[] { "playlist_id", "order_index" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistItem_CreatedAt",
                table: "playlist_items",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistItem_UpdatedAt",
                table: "playlist_items",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Playlist_CreatedAt",
                table: "playlists",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Playlist_UpdatedAt",
                table: "playlists",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_playlists_created_by_user_id",
                table: "playlists",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_playlists_name",
                table: "playlists",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_playlists_status",
                table: "playlists",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_qr_codes_created_at",
                table: "qr_codes",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_qr_codes_device_id",
                table: "qr_codes",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "IX_qr_codes_expiry_date",
                table: "qr_codes",
                column: "expiry_date");

            migrationBuilder.CreateIndex(
                name: "IX_qr_codes_name",
                table: "qr_codes",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_qr_codes_status",
                table: "qr_codes",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_qr_codes_type",
                table: "qr_codes",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_device_id",
                table: "refresh_tokens",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_CreatedAt",
                table: "refresh_tokens",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UpdatedAt",
                table: "refresh_tokens",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_ExpiresAt",
                table: "refresh_tokens",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_IsRevoked",
                table: "refresh_tokens",
                column: "is_revoked");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_TokenValue",
                table: "refresh_tokens",
                column: "token_value",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "refresh_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_registration_audit_logs_action",
                table: "registration_audit_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "ix_registration_audit_logs_device_registration_request_id",
                table: "registration_audit_logs",
                column: "device_registration_request_id");

            migrationBuilder.CreateIndex(
                name: "ix_registration_audit_logs_result",
                table: "registration_audit_logs",
                column: "result");

            migrationBuilder.CreateIndex(
                name: "ix_registration_audit_logs_user_id",
                table: "registration_audit_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLog_CreatedAt",
                table: "registration_audit_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationAuditLog_UpdatedAt",
                table: "registration_audit_logs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "ix_registration_records_device_id_timestamp",
                table: "registration_records",
                columns: new[] { "device_id", "timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_registration_records_user_id",
                table: "registration_records",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecord_CreatedAt",
                table: "registration_records",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRecord_UpdatedAt",
                table: "registration_records",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_scene_items_media_id",
                table: "scene_items",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "IX_scene_items_scene_id_z_index",
                table: "scene_items",
                columns: new[] { "scene_id", "z_index" });

            migrationBuilder.CreateIndex(
                name: "IX_SceneItem_CreatedAt",
                table: "scene_items",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_SceneItem_UpdatedAt",
                table: "scene_items",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Scene_CreatedAt",
                table: "scenes",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Scene_UpdatedAt",
                table: "scenes",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_scenes_background_image_id",
                table: "scenes",
                column: "background_image_id");

            migrationBuilder.CreateIndex(
                name: "IX_scenes_created_by_user_id",
                table: "scenes",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_scenes_is_template",
                table: "scenes",
                column: "is_template");

            migrationBuilder.CreateIndex(
                name: "IX_scenes_layout_type",
                table: "scenes",
                column: "layout_type");

            migrationBuilder.CreateIndex(
                name: "IX_scenes_name",
                table: "scenes",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_scenes_template_name",
                table: "scenes",
                column: "template_name");

            migrationBuilder.CreateIndex(
                name: "ix_schedule_devices_device_active",
                table: "schedule_devices",
                columns: new[] { "device_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_schedule_devices_device_id",
                table: "schedule_devices",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "ix_schedule_devices_is_active",
                table: "schedule_devices",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_schedule_devices_schedule_active",
                table: "schedule_devices",
                columns: new[] { "schedule_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_schedule_devices_schedule_id",
                table: "schedule_devices",
                column: "schedule_id");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleDevice_CreatedAt",
                table: "schedule_devices",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleDevice_UpdatedAt",
                table: "schedule_devices",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "uq_schedule_devices_schedule_id_device_id",
                table: "schedule_devices",
                columns: new[] { "schedule_id", "device_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_schedule_medias_media_id",
                table: "schedule_medias",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "ix_schedule_medias_schedule_id_order",
                table: "schedule_medias",
                columns: new[] { "schedule_id", "order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleMedia_CreatedAt",
                table: "schedule_medias",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleMedia_UpdatedAt",
                table: "schedule_medias",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_CreatedAt",
                table: "schedules",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_UpdatedAt",
                table: "schedules",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_IsDefault",
                table: "schedules",
                column: "is_default");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_Priority",
                table: "schedules",
                column: "priority");

            migrationBuilder.CreateIndex(
                name: "ix_service_instances_endpoint_url",
                table: "service_instances",
                column: "endpoint_url");

            migrationBuilder.CreateIndex(
                name: "ix_service_instances_is_active",
                table: "service_instances",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_service_instances_last_seen",
                table: "service_instances",
                column: "last_seen");

            migrationBuilder.CreateIndex(
                name: "ix_service_instances_service_id_instance_id",
                table: "service_instances",
                columns: new[] { "service_id", "instance_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_service_instances_status",
                table: "service_instances",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstance_CreatedAt",
                table: "service_instances",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInstance_UpdatedAt",
                table: "service_instances",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_Service_CreatedAt",
                table: "services",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Service_UpdatedAt",
                table: "services",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "ix_services_is_active",
                table: "services",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_services_last_heartbeat",
                table: "services",
                column: "last_heartbeat");

            migrationBuilder.CreateIndex(
                name: "ix_services_name",
                table: "services",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_services_name_version",
                table: "services",
                columns: new[] { "name", "version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_services_status",
                table: "services",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_services_type",
                table: "services",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "ix_user_device_associations_association_type",
                table: "user_device_associations",
                column: "association_type");

            migrationBuilder.CreateIndex(
                name: "ix_user_device_associations_device_id",
                table: "user_device_associations",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_device_associations_user_id",
                table: "user_device_associations",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_device_associations_user_id_device_id",
                table: "user_device_associations",
                columns: new[] { "user_id", "device_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociation_CreatedAt",
                table: "user_device_associations",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceAssociation_UpdatedAt",
                table: "user_device_associations",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_user_device_group_permissions_created_by",
                table: "user_device_group_permissions",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_user_device_group_permissions_device_group_id",
                table: "user_device_group_permissions",
                column: "device_group_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_device_group_permissions_user_id",
                table: "user_device_group_permissions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermission_CreatedAt",
                table: "user_device_group_permissions",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserDeviceGroupPermission_UpdatedAt",
                table: "user_device_group_permissions",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "uq_user_device_group_permissions_user_id_device_group_id",
                table: "user_device_group_permissions",
                columns: new[] { "user_id", "device_group_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_schedules_assigned_by_user_id",
                table: "user_schedules",
                column: "assigned_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedule_CreatedAt",
                table: "user_schedules",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedule_UpdatedAt",
                table: "user_schedules",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_ScheduleId",
                table: "user_schedules",
                column: "schedule_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_UserId",
                table: "user_schedules",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserSchedules_UserId_ScheduleId",
                table: "user_schedules",
                columns: new[] { "user_id", "schedule_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_CreatedAt",
                table: "users",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_User_UpdatedAt",
                table: "users",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_username",
                table: "users",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_ConnectionId",
                table: "web_socket_connection_logs",
                column: "connection_id");

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_CreatedAt",
                table: "web_socket_connection_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_UpdatedAt",
                table: "web_socket_connection_logs",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_WebSocketConnectionLog_UserId_DisconnectedAt",
                table: "web_socket_connection_logs",
                columns: new[] { "UserId", "disconnected_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assignment_histories");

            migrationBuilder.DropTable(
                name: "device_approvals");

            migrationBuilder.DropTable(
                name: "device_capabilities");

            migrationBuilder.DropTable(
                name: "device_configurations");

            migrationBuilder.DropTable(
                name: "device_group_audit_logs");

            migrationBuilder.DropTable(
                name: "device_status_logs");

            migrationBuilder.DropTable(
                name: "hardware_detection_jobs");

            migrationBuilder.DropTable(
                name: "health_check_results");

            migrationBuilder.DropTable(
                name: "media_variants");

            migrationBuilder.DropTable(
                name: "permission_audit_logs");

            migrationBuilder.DropTable(
                name: "playback_states");

            migrationBuilder.DropTable(
                name: "playlist_assignments");

            migrationBuilder.DropTable(
                name: "playlist_items");

            migrationBuilder.DropTable(
                name: "qr_codes");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "registration_audit_logs");

            migrationBuilder.DropTable(
                name: "registration_records");

            migrationBuilder.DropTable(
                name: "scene_items");

            migrationBuilder.DropTable(
                name: "schedule_devices");

            migrationBuilder.DropTable(
                name: "schedule_medias");

            migrationBuilder.DropTable(
                name: "user_device_associations");

            migrationBuilder.DropTable(
                name: "user_device_group_permissions");

            migrationBuilder.DropTable(
                name: "user_schedules");

            migrationBuilder.DropTable(
                name: "web_socket_connection_logs");

            migrationBuilder.DropTable(
                name: "assignments");

            migrationBuilder.DropTable(
                name: "device_hardware_profiles");

            migrationBuilder.DropTable(
                name: "service_instances");

            migrationBuilder.DropTable(
                name: "playlists");

            migrationBuilder.DropTable(
                name: "device_registration_requests");

            migrationBuilder.DropTable(
                name: "scenes");

            migrationBuilder.DropTable(
                name: "schedules");

            migrationBuilder.DropTable(
                name: "services");

            migrationBuilder.DropTable(
                name: "devices");

            migrationBuilder.DropTable(
                name: "medias");

            migrationBuilder.DropTable(
                name: "device_groups");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
