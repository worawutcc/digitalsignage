using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnhancePlaylistManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_template",
                table: "playlists",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_played_at",
                table: "playlists",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "play_count",
                table: "playlists",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "thumbnail_url",
                table: "playlists",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "device_playlists",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    playlist_id = table.Column<int>(type: "integer", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    scheduled_start = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    scheduled_end = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    assigned_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_playlists", x => x.id);
                    table.ForeignKey(
                        name: "FK_device_playlists_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_device_playlists_playlists_playlist_id",
                        column: x => x.playlist_id,
                        principalTable: "playlists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "playlist_analytics",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    playlist_id = table.Column<int>(type: "integer", nullable: false),
                    device_id = table.Column<int>(type: "integer", nullable: false),
                    play_start_time = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    play_end_time = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    completed_successfully = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    media_items_played = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<int>(type: "integer", nullable: false, defaultValue: -1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_playlist_analytics", x => x.id);
                    table.ForeignKey(
                        name: "FK_playlist_analytics_devices_device_id",
                        column: x => x.device_id,
                        principalTable: "devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_playlist_analytics_playlists_playlist_id",
                        column: x => x.playlist_id,
                        principalTable: "playlists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_device_playlists_device_id",
                table: "device_playlists",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "IX_device_playlists_device_id_playlist_id",
                table: "device_playlists",
                columns: new[] { "device_id", "playlist_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_device_playlists_playlist_id",
                table: "device_playlists",
                column: "playlist_id");

            migrationBuilder.CreateIndex(
                name: "IX_DevicePlaylist_CreatedAt",
                table: "device_playlists",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_DevicePlaylist_UpdatedAt",
                table: "device_playlists",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_analytics_device_id",
                table: "playlist_analytics",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_analytics_play_start_time",
                table: "playlist_analytics",
                column: "play_start_time");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_analytics_playlist_id",
                table: "playlist_analytics",
                column: "playlist_id");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAnalytics_CreatedAt",
                table: "playlist_analytics",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistAnalytics_UpdatedAt",
                table: "playlist_analytics",
                column: "updated_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "device_playlists");

            migrationBuilder.DropTable(
                name: "playlist_analytics");

            migrationBuilder.DropColumn(
                name: "is_template",
                table: "playlists");

            migrationBuilder.DropColumn(
                name: "last_played_at",
                table: "playlists");

            migrationBuilder.DropColumn(
                name: "play_count",
                table: "playlists");

            migrationBuilder.DropColumn(
                name: "thumbnail_url",
                table: "playlists");
        }
    }
}
