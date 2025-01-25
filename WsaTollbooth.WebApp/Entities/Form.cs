namespace WsaTollbooth.WebApp.Entities;

public class Form
{
    public Guid Id { get; set; }
    
    public required string Name { get; set; }
    public required string Description { get; set; }
    
    public ICollection<FormField> Fields { get; set; }
    public ICollection<FormSubmission> Submissions { get; set; }
}