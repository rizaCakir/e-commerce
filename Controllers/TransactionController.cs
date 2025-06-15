using ebeytepe.Data;
using ebeytepe.Models;
using ebeytepe.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransactionController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] TransactionCreateDto dto)
    {
        var transaction = new Transaction
        {
            BuyerId = dto.BuyerId,
            SellerId = dto.SellerId,
            ItemId = dto.ItemId,
            Price = dto.Price,
            Date = DateTime.UtcNow,
        };

        await using var dbTransaction = await _context.Database.BeginTransactionAsync();

        try
        {

            _context.Transactions.Add(transaction);
            
            var sellerVC = await _context.VirtualCurrencies.FirstOrDefaultAsync(vc => vc.UserId == dto.SellerId);
            if (sellerVC == null)
                return BadRequest("Seller virtual currency not found.");

            sellerVC.Amount += dto.Price;

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return Ok(transaction);
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            return BadRequest($"Transaction failed: {ex.Message}");
        }
    }


    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _context.Transactions
            .Include(t => t.Buyer)
            .Include(t => t.Seller)
            .Include(t => t.Item)
            .ToListAsync();

        return Ok(transactions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Buyer)
            .Include(t => t.Seller)
            .Include(t => t.Item)
            .FirstOrDefaultAsync(t => t.TransactionId == id);

        if (transaction == null)
            return NotFound();

        return Ok(transaction);
    }
    
    [HttpPost("rate")]
    public async Task<IActionResult> RateUser([FromBody] RateUserDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Rating must be between 1 and 5.");

        var transaction = await _context.Transactions.FindAsync(dto.TransactionId);
        if (transaction == null)
            return NotFound("Transaction not found.");

        var seller = await _context.Users.FindAsync(transaction.SellerId);
        if (seller == null)
            return NotFound("Seller not found.");

        // Optionally prevent multiple ratings for same transaction
        if (transaction.Rating != null)
            return BadRequest("This transaction has already been rated.");

        seller.RatingTotal += dto.Rating;
        seller.RatingCount += 1;
        transaction.Rating = dto.Rating;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Rating submitted.",
            sellerId = seller.UserId,
            averageRating = (double)seller.RatingTotal / seller.RatingCount
        });
    }
    
    
    [HttpGet("by-item-id/{itemId}")]
    public async Task<IActionResult> GetTransactionByItemId(int itemId)
    {
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.ItemId == itemId);

        if (transaction == null)
            return NotFound("Transaction not found for this item.");

        return Ok(transaction);
    }


}