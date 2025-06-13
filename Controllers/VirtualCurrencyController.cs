using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ebeytepe.Models;
using ebeytepe.DTOs;
using ebeytepe.Data;

[Route("api/[controller]")]
[ApiController]
public class VirtualCurrencyController : ControllerBase
{
    private readonly AppDbContext _context;

    public VirtualCurrencyController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetBalance(int userId)
    {
        var vc = await _context.VirtualCurrencies.FirstOrDefaultAsync(vc => vc.UserId == userId);
        if (vc == null) return NotFound("Balance not found.");
        return Ok(vc);
    }

    [HttpPost]
    public async Task<IActionResult> Create(VirtualCurrencyCreateDto dto)
    {
        var exists = await _context.VirtualCurrencies.AnyAsync(vc => vc.UserId == dto.UserId);
        if (exists) return BadRequest("Balance already exists for this user.");

        var vc = new VirtualCurrency
        {
            UserId = dto.UserId,
            Amount = dto.Amount
        };

        _context.VirtualCurrencies.Add(vc);
        await _context.SaveChangesAsync();

        return Ok(vc);
    }

    [HttpPut("{userId}")]
    public async Task<IActionResult> UpdateBalance(int userId, [FromBody] decimal amount)
    {
        var vc = await _context.VirtualCurrencies.FirstOrDefaultAsync(vc => vc.UserId == userId);
        if (vc == null) return NotFound("Balance not found.");

        vc.Amount = amount;
        await _context.SaveChangesAsync();
        return Ok(vc);
    }
}