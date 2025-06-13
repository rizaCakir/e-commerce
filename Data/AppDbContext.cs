// Data/AppDbContext.cs


using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ebeytepe.Models;

namespace ebeytepe.Data
{


    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Bid> Bids { get; set; }
        public DbSet<Autobid> Autobids { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Favourite> Favourites { get; set; }
        public DbSet<VirtualCurrency> VirtualCurrencies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Autobid: composite primary key (UserId + ItemId)
            modelBuilder.Entity<Autobid>()
                .HasKey(ab => new { ab.UserId, ab.ItemId });

            modelBuilder.Entity<Autobid>()
                .HasOne(ab => ab.User)
                .WithMany(u => u.Autobids)
                .HasForeignKey(ab => ab.UserId);

            modelBuilder.Entity<Autobid>()
                .HasOne(ab => ab.Item)
                .WithMany(i => i.Autobids)
                .HasForeignKey(ab => ab.ItemId);

            // Favourite: composite primary key (UserId + ItemId)
            modelBuilder.Entity<Favourite>()
                .HasKey(f => new { f.UserId, f.ItemId });

            modelBuilder.Entity<Favourite>()
                .HasOne(f => f.User)
                .WithMany(u => u.Favourites)
                .HasForeignKey(f => f.UserId);

            modelBuilder.Entity<Favourite>()
                .HasOne(f => f.Item)
                .WithMany(i => i.Favourites)
                .HasForeignKey(f => f.ItemId);

            // Bid: many-to-one to User and Item
            modelBuilder.Entity<Bid>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bids)
                .HasForeignKey(b => b.UserId);

            modelBuilder.Entity<Bid>()
                .HasOne(b => b.Item)
                .WithMany(i => i.Bids)
                .HasForeignKey(b => b.ItemId);

            // Transaction: multiple foreign keys to User and Item
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Buyer)
                .WithMany(u => u.TransactionsAsBuyer)
                .HasForeignKey(t => t.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Seller)
                .WithMany(u => u.TransactionsAsSeller)
                .HasForeignKey(t => t.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Item)
                .WithMany(i => i.Transactions)
                .HasForeignKey(t => t.ItemId);

            // Item: one-to-many to User
            modelBuilder.Entity<Item>()
                .HasOne(i => i.User)
                .WithMany(u => u.Items)
                .HasForeignKey(i => i.UserId);

            // VirtualCurrency: one-to-one with User
            modelBuilder.Entity<VirtualCurrency>()
                .HasOne(vc => vc.User)
                .WithOne(u => u.VirtualCurrency)
                .HasForeignKey<VirtualCurrency>(vc => vc.UserId);
        }
    }
}