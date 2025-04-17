using System.Text;
using API.Data;
using API.Hubs;
using API.Models;
using API.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
var builder = WebApplication.CreateBuilder(args);

// Configure CORS with a named policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200") // Angular app origins
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Allow credentials for cookies, etc.
    });
});

var JwtSetting = builder.Configuration.GetSection("JwtSetting");

// Add services to the container
builder.Services.AddOpenApi();
builder.Services.AddSignalR();
builder.Services.AddDbContext<AppDbContext>(x => x.UseSqlite("Data Source = chat.db"));
builder.Services.AddIdentityCore<AppUser>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders();

builder.Services.AddScoped<TokenService>();

// Configure Authentication
builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(option =>
{
    option.SaveToken = true;
    option.RequireHttpsMetadata = false;
    option.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSetting.GetSection("SecurityKey").Value!)),
        ValidateIssuer = false,
        ValidateAudience = false,
    };

    option.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// **Ensure CORS is used before any other middleware that handles requests.**
app.UseCors("AllowLocalhost");  // Apply the named policy

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseStaticFiles();
app.UseAuthorization();

app.MapHub<ChatHub>("hubs/chat");
app.MapAccountEndpoint();

app.Run();
