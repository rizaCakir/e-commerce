namespace ebeytepe.DTOs;


public class AutobidCreateDto
{
    public int UserId { get; set; }
    public int ItemId { get; set; }
    public decimal MaxBid { get; set; }
    public decimal Increment { get; set; }
}
