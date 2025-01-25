namespace WsaTollbooth.WebApp.Entities;

public class SelectFormField: FormField
{
    public ICollection<string> Options { get; set; } = [];
}