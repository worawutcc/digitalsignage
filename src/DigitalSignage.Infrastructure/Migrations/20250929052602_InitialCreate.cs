using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
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
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
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
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceGroups", x => x.Id);
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
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true)
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
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true)
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
                name: "Devices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Location = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    Resolution = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LastHeartbeat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ManagedByUserId = table.Column<int>(type: "integer", nullable: true),
                    DeviceGroupId = table.Column<int>(type: "integer", nullable: true)
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
                        name: "FK_Devices_Users_ManagedByUserId",
                        column: x => x.ManagedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

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
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EstimatedEndAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ErrorOccurredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsSynced = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LastSyncAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SyncToken = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
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
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    RecurrencePattern = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DaysOfWeek = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AssignedByUserId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                name: "Schedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeviceId = table.Column<int>(type: "integer", nullable: false)
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
                name: "ScheduleMedias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                    MediaId = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroups_CreatedAt",
                table: "DeviceGroups",
                column: "CreatedAt");

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
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Devices_DeviceGroupId",
                table: "Devices",
                column: "DeviceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_ManagedByUserId",
                table: "Devices",
                column: "ManagedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Medias_CreatedAt",
                table: "Medias",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Medias_S3Key",
                table: "Medias",
                column: "S3Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Medias_Type",
                table: "Medias",
                column: "Type");

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
                name: "IX_PlaybackStates_LastUpdatedAt",
                table: "PlaybackStates",
                column: "LastUpdatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackStates_PlaylistId",
                table: "PlaybackStates",
                column: "PlaylistId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackStates_Status",
                table: "PlaybackStates",
                column: "Status");

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
                name: "IX_PlaylistAssignments_EndDate",
                table: "PlaylistAssignments",
                column: "EndDate");

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
                name: "IX_PlaylistAssignments_StartDate",
                table: "PlaylistAssignments",
                column: "StartDate");

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
                name: "IX_Playlists_CreatedAt",
                table: "Playlists",
                column: "CreatedAt");

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
                name: "IX_SceneItems_MediaId",
                table: "SceneItems",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_SceneItems_SceneId_ZIndex",
                table: "SceneItems",
                columns: new[] { "SceneId", "ZIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_BackgroundImageId",
                table: "Scenes",
                column: "BackgroundImageId");

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_CreatedAt",
                table: "Scenes",
                column: "CreatedAt");

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
                name: "IX_ScheduleMedias_MediaId",
                table: "ScheduleMedias",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleMedias_ScheduleId_Order",
                table: "ScheduleMedias",
                columns: new[] { "ScheduleId", "Order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_DeviceId",
                table: "Schedules",
                column: "DeviceId");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlaybackStates");

            migrationBuilder.DropTable(
                name: "PlaylistAssignments");

            migrationBuilder.DropTable(
                name: "PlaylistItems");

            migrationBuilder.DropTable(
                name: "SceneItems");

            migrationBuilder.DropTable(
                name: "ScheduleMedias");

            migrationBuilder.DropTable(
                name: "Playlists");

            migrationBuilder.DropTable(
                name: "Scenes");

            migrationBuilder.DropTable(
                name: "Schedules");

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
