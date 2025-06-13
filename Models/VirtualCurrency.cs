using System.ComponentModel.DataAnnotations;

namespace ebeytepe.Models;

public class VirtualCurrency
{
    [Key]
    public int UserId { get; set; }
    public decimal Amount { get; set; }

    public User User { get; set; }
}