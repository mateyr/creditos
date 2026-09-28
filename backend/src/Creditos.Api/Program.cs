using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;

using Creditos.Api.Authentication;
using Creditos.Api.Common.Endpoints;
using Creditos.Api.Common.ExceptionHandlers;
using Creditos.Api.Common.Extensions;
using Creditos.Api.Database;

using FluentValidation;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string"
        + " 'DefaultConnection' not found.");

var jwtSecret =
    builder.Configuration["Jwt:Secret"]
        ?? throw new InvalidOperationException("Configuration value 'Jwt:Secret' not found.");

builder.Services.AddDbContext<CreditosContext>(options =>
    options.UseSqlite(connectionString));

// Identity solo gestiona usuarios y contraseñas; el token lo emite TokenProvider (JWT estándar).
builder.Services.AddIdentityCore<IdentityUser>()
    .AddEntityFrameworkStores<CreditosContext>()
    .AddSignInManager();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddExceptionHandler<ConcurrencyExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddSingleton<ITokenProvider, TokenProvider>();
builder.Services.AddScoped<AuthTokenService>();

builder.Services.AddSingleton(TimeProvider.System);

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Mensajes por defecto de FluentValidation en español.
ValidatorOptions.Global.LanguageManager.Culture = new CultureInfo("es");

builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

builder.Services.AddEndpoints(Assembly.GetExecutingAssembly());

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options => options.AddDocumentTransformer<BearerSecuritySchemeTransformer>());

var app = builder.Build();

app.ApplyMigrations();

await app.SeedDefaultUserAsync();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseExceptionHandler();

app.UseAuthentication();

app.UseAuthorization();

app.MapEndpoints(app.MapGroup("api"));

await app.RunAsync();
