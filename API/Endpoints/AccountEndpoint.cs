using API.Common;
using API.DTOs;
using API.Extentions;
using API.Models;
using API.Service;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public static class AccountEndpoint
{
    public static RouteGroupBuilder MapAccountEndpoint(this WebApplication app)
    {
        var group = app.MapGroup("/api/account").WithTags("accounts");

        group.MapPost("/register", async (HttpContext context, UserManager<AppUser> UserManager,
        [FromForm] string fullName, [FromForm] string email, [FromForm] string password,[FromForm] string username,[FromForm] IFormFile?  profileImage) =>
        {
            var userFromDb = await UserManager.FindByEmailAsync(email);

            if (userFromDb is not null)
            {
                return Results.BadRequest(Response<string>.Failure("User already exists."));
            }

            if(profileImage is null)
            {
                return Results.BadRequest(Response<string>.Failure("Profile image is required..."));
            }

            var picture = await FileUpload.Upload(profileImage);

            picture = $"{context.Request.Scheme}://{context.Request.Host}/uploads/{picture}";

            var user = new AppUser
            {
                Email = email,
                FullName = fullName, // Ensure AppUser has a FullName property
                UserName = username ,    // Required for Identity
                ProfileImage = picture
            };

            var result = await UserManager.CreateAsync(user, password);

            if (!result.Succeeded)
            {
                return Results.BadRequest(Response<string>.Failure(
                    string.Join(", ", result.Errors.Select(x => x.Description))
                ));
            }

            return Results.Ok(Response<string>.Success("", "User created successfully."));
        }).DisableAntiforgery();


        // ###################################################################################################################endregion

        group.MapPost("/login",async(UserManager<AppUser> UserManager,
        TokenService tokenService , LoginDto dto) =>{
            if(dto is null)
            {
                return Results.BadRequest(Response<string>.Failure("Invalid login details"));
            }

            var user = await UserManager.FindByEmailAsync(dto.Email);

            if(user is null)
            {
                return Results.BadRequest(Response<string>.Failure("user not found"));
            }

            var result = await UserManager.CheckPasswordAsync(user!,dto.password);

            if(!result)
            {
                return Results.BadRequest(Response<string>.Failure("Invalid Password"));
            }

            var token =tokenService.GenerateToken(user.Id,user.UserName);
            return Results.Ok(Response<string>.Success(token,"Login Successfully"));
        });


        group.MapGet("/me",async (HttpContext context,UserManager<AppUser> userManager)=>{
            var currentLoggedInUserId = context.User.GetUserId()!;

            var currentLoggedInUser = await userManager.Users.SingleOrDefaultAsync(x=>x.Id == currentLoggedInUserId.ToString());

            return Results.Ok(Response<AppUser>.Success(currentLoggedInUser!,"User fetched successfully.."));
        }).RequireAuthorization();

        return group; // <-- Missing semicolon added here
    }



}

