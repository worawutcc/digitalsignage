using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignmentSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                        name: "FK_Assignment_Device",
                        column: x => x.target_id,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Assignment_DeviceGroup",
                        column: x => x.target_id,
                        principalTable: "DeviceGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_assignments_Users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_assignments_Users_last_modified_by_user_id",
                        column: x => x.last_modified_by_user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
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
                        name: "FK_assignment_histories_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_assignment_histories_assignments_assignment_id",
                        column: x => x.assignment_id,
                        principalTable: "assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                name: "IX_assignments_last_modified_by_user_id",
                table: "assignments",
                column: "last_modified_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_target_id",
                table: "assignments",
                column: "target_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assignment_histories");

            migrationBuilder.DropTable(
                name: "assignments");
        }
    }
}
