using Microsoft.EntityFrameworkCore;
using WsaTollbooth.WebApp.Entities;

namespace WsaTollbooth.WebApp.Context;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<Form> Forms { get; set; }
    public DbSet<FormField> FormFields { get; set; }
    public DbSet<FormFieldSubmission> FormFieldSubmissions { get; set; }
    public DbSet<FormSubmission> FormSubmissions { get; set; }
    public DbSet<SelectFormField> SelectFormFields { get; set; }
    public DbSet<TextFormField> TextFormFields { get; set; }
    public DbSet<Otp> Otps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<FormField>()
            .UseTptMappingStrategy();

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}