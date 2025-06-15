using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ebeytepe.Models;

public class Transaction
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int TransactionId { get; set; }

    public int BuyerId { get; set; }
    public int SellerId { get; set; }
    public int ItemId { get; set; }
    public decimal Price { get; set; }
    public DateTime Date { get; set; }
    public int? Rating { get; set; }

    public User Buyer { get; set; }
    public User Seller { get; set; }
    public Item Item { get; set; }
}