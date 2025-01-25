namespace WsaTollbooth.WebApp.Entities;

public class FormFieldSubmission
{
    public Guid Id { get; set; }
    
    public required string Value { get; set; }

    public FormField FormField { get; set; }
    public FormSubmission Submission { get; set; }
}