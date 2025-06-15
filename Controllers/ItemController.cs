using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ebeytepe.Data;
using ebeytepe.Models;
using ebeytepe.DTOs;
using Microsoft.AspNetCore.Authorization;


namespace ebeytepe.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ItemController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Item
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.Items.Include(i => i.User).ToListAsync();
            return Ok(items);
        }

        // GET: api/Item/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _context.Items.Include(i => i.User).FirstOrDefaultAsync(i => i.ItemId == id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        // POST: api/Item
        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] ItemCreateDto dto)
        {
            
            if (dto.StartingPrice > dto.BuyoutPrice)
            {
                return BadRequest("Starting price cannot be higher than buyout price.");
            }
            
            var item = new Item
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                StartingPrice = dto.StartingPrice,
                CurrentPrice = dto.CurrentPrice,
                BuyoutPrice = dto.BuyoutPrice,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Condition = dto.Condition,
                IsActive = dto.IsActive,
                Image = dto.ImageFile?.FileName // Just store file name for now (or handle save)
            };

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = item.ItemId }, item);
        }


        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ItemUpdateDto dto)
        {
            if (id != dto.ItemId) return BadRequest();

            var item = await _context.Items.FindAsync(id);
            if (item == null) return NotFound();

            item.Title = dto.Title;
            item.Description = dto.Description;
            item.Category = dto.Category;
            item.CurrentPrice = dto.CurrentPrice;
            item.StartingPrice = dto.StartingPrice;
            item.BuyoutPrice = dto.BuyoutPrice;
            item.StartTime = dto.StartTime;
            item.EndTime = dto.EndTime;
            item.Image = dto.Image;
            item.Condition = dto.Condition;
            item.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return NoContent();
        }


        // DELETE: api/Item/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null) return NotFound();
            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [AllowAnonymous]
        [HttpGet("sorted-by-price")]
        public async Task<ActionResult<IEnumerable<Item>>> GetItemsSortedByPrice(
            [FromQuery] bool desc = false,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string category = "All",
            [FromQuery] string condition = "All")
        {
            var offset = (page - 1) * pageSize;

            var items = await _context.Items
                .FromSqlRaw("SELECT * FROM SortItemsByCurrentPrice({0}, {1}, {2}, {3}, {4})",
                    desc, pageSize, offset, category, condition)
                .ToListAsync();

            return Ok(items);
        }


        [AllowAnonymous]
        [HttpGet("sorted-by-endtime")]
        public async Task<ActionResult<IEnumerable<Item>>> GetItemsSortedByEndTime(
            [FromQuery] bool desc = false,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string category = "All",
            [FromQuery] string condition = "All")
        
        
        {
            var offset = (page - 1) * pageSize;

            var items = await _context.Items
                .FromSqlRaw("SELECT * FROM SortItemsByEndTimePaged({0}, {1}, {2}, {3}, {4})",
                    desc, pageSize, offset, category, condition)
                .ToListAsync();

            return Ok(items);
        }

        [Authorize]
        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetItemsByUser(int userId)
        {
            var items = await _context.Items
                .Where(i => i.UserId == userId)
                .Include(i => i.User)
                .ToListAsync();

            return Ok(items);
            
        }
        
        [Authorize]
        // GET: api/Item/bought-by-user/8
        [HttpGet("bought-by-user/{userId}")]
        public async Task<IActionResult> GetBoughtItemsByUser(int userId)
        {
            var items = await _context.Transactions
                .Where(t => t.BuyerId == userId)
                .Include(t => t.Item)
                .ThenInclude(i => i.User) 
                .Select(t => t.Item)
                .ToListAsync();

            return Ok(items);
        }

    }
}
