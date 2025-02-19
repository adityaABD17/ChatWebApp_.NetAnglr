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

builder.Services.AddCors(
    options=>{
        options.AddDefaultPolicy(builder=>{
            builder.WithOrigins("http://localhost:4200","https://localhost:4200").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        });
    }
);

var JwtSetting = builder.Configuration.GetSection("JwtSetting");

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddSignalR();

builder.Services.AddDbContext<AppDbContext>(x => x.UseSqlite("Data Source = chat.db"));

builder.Services.AddIdentityCore<AppUser>()
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddScoped<TokenService>();

builder.Services.AddAuthentication(opt =>{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(option =>{
    option.SaveToken = true;
    option.RequireHttpsMetadata = false;
    option.TokenValidationParameters = new TokenValidationParameters{
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes
        (JwtSetting.GetSection("SecurityKey").Value!)),
        ValidateIssuer = false,
        ValidateAudience = false,
    };

option.Events = new JwtBearerEvents{
    OnMessageReceived = context=>{
        var accessToken = context.Request.Query["access_token"];
        var path = context.HttpContext.Request.Path;

        if(!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hus"))
        {
            context.Token = accessToken;
        }
        return Task.CompletedTask;
    }
};

});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseStaticFiles();
app.UseAuthorization();

app.MapHub<ChatHub>("hubs/chat");

app.UseCors(x=>x.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("http://localhost4200","https://localhost4200"));

app.MapAccountEndpoint();

app.Run();

