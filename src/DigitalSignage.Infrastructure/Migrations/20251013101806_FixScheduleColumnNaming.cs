using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixScheduleColumnNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StartTime",
                table: "schedules",
                newName: "start_time");

            migrationBuilder.RenameColumn(
                name: "IsRecurring",
                table: "schedules",
                newName: "is_recurring");

            migrationBuilder.RenameColumn(
                name: "EndTime",
                table: "schedules",
                newName: "end_time");

            migrationBuilder.AlterColumn<bool>(
                name: "is_recurring",
                table: "schedules",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "start_time",
                table: "schedules",
                newName: "StartTime");

            migrationBuilder.RenameColumn(
                name: "is_recurring",
                table: "schedules",
                newName: "IsRecurring");

            migrationBuilder.RenameColumn(
                name: "end_time",
                table: "schedules",
                newName: "EndTime");

            migrationBuilder.AlterColumn<bool>(
                name: "IsRecurring",
                table: "schedules",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: false);
        }
    }
}
