using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalSignage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSourceFieldToSchedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "source",
                table: "schedules",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Default",
                comment: "Source of schedule creation: Default, API, Import, Template, Bulk, System");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Schedule_Source",
                table: "schedules",
                sql: "source IN ('Default', 'API', 'Import', 'Template', 'Bulk', 'System')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Schedule_Source",
                table: "schedules");

            migrationBuilder.DropColumn(
                name: "source",
                table: "schedules");
        }
    }
}
