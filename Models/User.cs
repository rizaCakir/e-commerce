using ebeytepe.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserId { get; set; }

    public string Name { get; set; }
    public string PasswordHash { get; set; }


    [NotMapped]
    public string? Password { get; set; } 

    public string Email { get; set; }
    public string StudentId { get; set; }
    public int RatingTotal { get; set; } = 0;        
    public int RatingCount { get; set; } = 0;        
    
    [NotMapped]
    public double AverageRating => RatingCount > 0 ? (double)RatingTotal / RatingCount : 0.0;

    public IEnumerable<Favourite>? Favourites { get; set; }
    public IEnumerable<Bid>? Bids { get; set; }
    public IEnumerable<Transaction>? TransactionsAsBuyer { get; set; }
    public IEnumerable<Transaction>? TransactionsAsSeller { get; set; }
    public IEnumerable<Item>? Items { get; set; }
    public VirtualCurrency? VirtualCurrency { get; set; }
}