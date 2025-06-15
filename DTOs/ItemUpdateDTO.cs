public class ItemUpdateDto
{
    public int ItemId { get; set; }
    public string Title { get; set; }
    public ItemCategory Category { get; set; }
    public ItemCondition Condition { get; set; }
    public string Description { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal StartingPrice { get; set; }
    public decimal BuyoutPrice { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Image { get; set; }

    public bool IsActive { get; set; }
}