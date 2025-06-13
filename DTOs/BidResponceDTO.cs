namespace ebeytepe.DTOs;

public class BidResponseDto
{
    public int BidId { get; set; }
    public decimal Amount { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
}
