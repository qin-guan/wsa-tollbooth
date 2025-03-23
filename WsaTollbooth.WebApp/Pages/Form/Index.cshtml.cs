using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WsaTollbooth.WebApp.Context;

namespace WsaTollbooth.WebApp.Pages.Form;

public class Index(AppDbContext dbContext) : PageModel
{
    public async Task<IActionResult> OnGet()
    {
        var formId = Guid.Parse(RouteData.Values["FormId"] as string ?? throw new InvalidOperationException());
        var form = await dbContext.Forms.SingleOrDefaultAsync(f => f.Id == formId);
        if (form is null)
        {
            return NotFound();
        }

        return Page();
    }
}