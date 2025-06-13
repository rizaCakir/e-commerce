using ebeytepe.Data;
using ebeytepe.Models;
using ebeytepe.Dtos;
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
}