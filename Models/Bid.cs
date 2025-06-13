using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ebeytepe.Models;

public class Bid
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int BidId { get; set; }

    public int ItemId { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public DateTime BidTime { get; set; } = DateTime.UtcNow;


    public Item Item { get; set; }
    public User User { get; set; }
}