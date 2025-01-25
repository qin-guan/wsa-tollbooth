namespace WsaTollbooth.WebApp.Entities;

public class FormSubmission
{
    public Guid Id { get; set; }
    
    public DateTime SubmittedOn { get; set; }
    
    public Form Form { get; set; }
    public ICollection<FormFieldSubmission> Submissions { get; set; }
}