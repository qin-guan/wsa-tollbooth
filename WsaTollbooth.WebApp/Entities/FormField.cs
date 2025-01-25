namespace WsaTollbooth.WebApp.Entities;

public abstract class FormField
{
    public Guid Id { get; set; }
    
    public required string Title { get; set; }
    public required string Description { get; set; }

    public ICollection<FormFieldSubmission> Submissions { get; set; } = [];
}