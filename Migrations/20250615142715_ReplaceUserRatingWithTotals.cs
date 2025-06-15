using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ebeytepe.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceUserRatingWithTotals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Reputation",
                table: "Users",
                newName: "RatingTotal");

            migrationBuilder.AddColumn<int>(
                name: "RatingCount",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RatingCount",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "RatingTotal",
                table: "Users",
                newName: "Reputation");
        }
    }
}
