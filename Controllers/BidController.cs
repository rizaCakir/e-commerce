using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ebeytepe.Data;
using ebeytepe.DTOs;
using Npgsql;

[Route("api/[controller]")]
[ApiController]
public class BidController : ControllerBase
{
    private readonly AppDbContext _context;

    public BidController(AppDbContext context)
    {
        _context = context;
    }
    

    [HttpPost]
    public async Task<IActionResult> Create(BidCreateDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            await _context.Database.ExecuteSqlRawAsync(
                "CALL place_bid(@userId, @itemId, @amount);",
                new NpgsqlParameter("@userId", dto.UserId),
                new NpgsqlParameter("@itemId", dto.ItemId),
                new NpgsqlParameter("@amount", dto.Amount)
            );

            await transaction.CommitAsync();
            return Ok("Bid placed successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return BadRequest($"Transaction failed: {ex.Message}");
        }
    }
    
    [HttpPost("buyout")]
    public async Task<IActionResult> BuyoutItem([FromBody] BuyoutDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            await _context.Database.ExecuteSqlRawAsync(
                "CALL buyout_item(@userId, @itemId);",
                new NpgsqlParameter("@userId", dto.UserId),
                new NpgsqlParameter("@itemId", dto.ItemId)
            );

            await transaction.CommitAsync();
            return Ok("Item bought out successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return BadRequest($"Buyout failed: {ex.Message}");
        }
    }



    [HttpGet("{itemId}")]
    public async Task<IActionResult> GetBidsForItem(int itemId)
    {
        var bids = await _context.Bids
            .Where(b => b.ItemId == itemId)
            .OrderByDescending(b => b.Amount)
            .Select(b => new BidResponseDto
            {
                BidId = b.BidId,
                Amount = b.Amount,
                UserId = b.UserId,
                UserName = b.User.Name
            })
            .ToListAsync();

        return Ok(bids);
    }
}
