using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using ebeytepe.DTOs;
using ebeytepe.Data;
using ebeytepe.Models;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class FavouritesController : ControllerBase
{
    private readonly AppDbContext _context;

    public FavouritesController(AppDbContext context)
    {
        _context = context;
    }

    // Add to favourites
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddToFavourites([FromBody] FavouriteDto dto)
    {
        var existing = await _context.Favourites.FindAsync(dto.UserId, dto.ItemId);
        if (existing != null)
        {
            return BadRequest("Already in favourites.");
        }

        var fav = new Favourite
        {
            UserId = dto.UserId,
            ItemId = dto.ItemId
        };

        _context.Favourites.Add(fav);
        await _context.SaveChangesAsync();
        return Ok("Added to favourites.");
    }

    // Remove from favourites
    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> RemoveFromFavourites([FromQuery] int userId, [FromQuery] int itemId)
    {
        var fav = await _context.Favourites.FindAsync(userId, itemId);
        if (fav == null)
        {
            return NotFound("Favourite not found.");
        }

        _context.Favourites.Remove(fav);
        await _context.SaveChangesAsync();
        return Ok("Removed from favourites.");
    }

    // Get all favourites for a user
    [Authorize]
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetFavourites(int userId)
    {
        var favourites = await _context.Favourites
            .Where(f => f.UserId == userId)
            .Include(f => f.Item)
            .Select(f => new
            {
                f.Item.ItemId,
                f.Item.Title,
                f.Item.Description,
                f.Item.CurrentPrice
            })
            .ToListAsync();

        return Ok(favourites);
    }
}