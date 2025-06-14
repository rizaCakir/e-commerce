using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ebeytepe.Models
{
    public class Item
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemId { get; set; }

        public int UserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public decimal StartingPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal BuyoutPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Image { get; set; }
        public string Condition { get; set; }
        public bool IsActive { get; set; }

        [JsonIgnore]
        public User User { get; set; }

        public IEnumerable<Favourite>? Favourites { get; set; }
        public IEnumerable<Bid>? Bids { get; set; }
        public IEnumerable<Transaction>? Transactions { get; set; }
    }
}