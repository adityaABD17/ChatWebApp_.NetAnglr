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

        _ = group.MapPost("/register", async (HttpContext context, UserManager<AppUser> UserManager,
        [FromForm] string fullName, [FromForm] string email, [FromForm] string password, [FromForm] string username, [FromForm] IFormFile? profileImage) =>
        {
            var userFromDb = await UserManager.FindByEmailAsync(email);

            if (userFromDb is not null)
            {
                return Results.BadRequest(Response<string>.Failure("User already exists."));
            }

            if (profileImage is null)
            {
                return Results.BadRequest(Response<string>.Failure("Profile image is required..."));
            }

            var picture = await FileUpload.Upload(profileImage);

            picture = $"{context.Request.Scheme}://{context.Request.Host}/uploads/{picture}";

            var user = new AppUser
            {
                Email = email,
                FullName = fullName, // Ensure AppUser has a FullName property
                UserName = username,
                ProfileImage = picture
            };

            Console.WriteLine("Username"+user.UserName);

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

        var unused = group.MapPost("/login", async (UserManager<AppUser> userManager,
                                      TokenService tokenService, LoginDto dto) =>
       {
           // Check if DTO is null
           if (dto is null)
           {
               return Results.BadRequest(Response<string>.Failure("Empty login details"));
           }

           // Log email to make sure it's coming through
           Console.WriteLine("Email: " + dto.Email);

           // Find user by email
#pragma warning disable CS8600 // Converting null literal or possible null value to non-nullable type.
           AppUser user = await userManager.FindByEmailAsync(dto.Email);
#pragma warning restore CS8600 // Converting null literal or possible null value to non-nullable type.

           if (user is null)
           {
               // Provide a more informative error message
               return Results.BadRequest(Response<string>.Failure("User not found"));
           }

           // Check password validity
           var result = await userManager.CheckPasswordAsync(user, dto.password);
           if (!result)
           {
               // Return specific failure message for incorrect password
               return Results.BadRequest(Response<string>.Failure("Password doesn't match"));
           }

           // Ensure userId and userName are not null or empty
           if (string.IsNullOrEmpty(user.Id) || string.IsNullOrEmpty(user.UserName))
           {
               return Results.BadRequest(Response<string>.Failure("User information is incomplete"));
           }

           // Generate the JWT token
           var token = tokenService.GenerateToken(user.Id, user.UserName);

           // Return success response with token
           return Results.Ok(Response<string>.Success(token, "Login Successful"));
       });



        group.MapGet("/me",async (HttpContext context,UserManager<AppUser> userManager)=>{
            var currentLoggedInUserId = context.User.GetUserId()!;

            var currentLoggedInUser = await userManager.Users.SingleOrDefaultAsync(x=>x.Id == currentLoggedInUserId.ToString());

            return Results.Ok(Response<AppUser>.Success(currentLoggedInUser!,"User fetched successfully.."));
        }).RequireAuthorization();

        return group; // <-- Missing semicolon added here
    }



}

