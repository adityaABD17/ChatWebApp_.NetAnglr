using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class messagesUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_AspNetUsers_MyPropertyId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_MyPropertyId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "MyPropertyId",
                table: "Messages");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MyPropertyId",
                table: "Messages",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_MyPropertyId",
                table: "Messages",
                column: "MyPropertyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_AspNetUsers_MyPropertyId",
                table: "Messages",
                column: "MyPropertyId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
