namespace WsaTollbooth.WebApp.Entities;

public class Otp
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string Code { get; set; }
    public required DateTime CreatedAt { get; set; }
}