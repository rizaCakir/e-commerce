using System.Text.Json.Serialization;

namespace ebeytepe.Models;

public class Autobid
{
    public int UserId { get; set; }
    public int ItemId { get; set; }
    public decimal MaxBid { get; set; }
    public decimal Increment { get; set; }

    public User User { get; set; }
    
    [JsonIgnore]
    public Item Item { get; set; }
}