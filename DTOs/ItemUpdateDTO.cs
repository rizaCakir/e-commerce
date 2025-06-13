public class ItemUpdateDto
{
    public int ItemId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal StartingPrice { get; set; }
    public decimal BuyoutPrice { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Image { get; set; }
    public string Condition { get; set; }
    public bool IsActive { get; set; }
}