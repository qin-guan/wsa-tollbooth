using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using WsaTollbooth.WebApp.Context;
using WsaTollbooth.WebApp.Entities;

namespace WsaTollbooth.WebApp.Pages.Auth;

public class Login(AppDbContext dbContext) : PageModel
{
    [BindProperty] public InputModel Input { get; set; }

    public class InputModel : IValidatableObject
    {
        [Required] [EmailAddress] public string Email { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var results = new List<ValidationResult>();

            if (!StaticStore.StaticStore.Admins.Contains(Email))
            {
                results.Add(new ValidationResult("Email is not an admin", ["Email"]));
            }

            return results;
        }
    }

    public async Task<IActionResult> OnPost()
    {
        if (!ModelState.IsValid) return Page();

        var otp = RandomNumberGenerator.GetInt32(100_000, 999_999);

        await dbContext.Otps.AddAsync(new Otp
        {
            Email = Input.Email,
            Code = otp.ToString(),
            CreatedAt = DateTime.Now
        });

        await dbContext.SaveChangesAsync();

        TempData["Email"] = Input.Email;

        return LocalRedirect("/Auth/LoginCode");
    }
}