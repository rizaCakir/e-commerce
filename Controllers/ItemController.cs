using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ebeytepe.Data;
using ebeytepe.Models;
using ebeytepe.DTOs;


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
        [HttpPost]
        public async Task<IActionResult> Create(ItemCreateDto dto)
        {
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
                Image = dto.Image,
                Condition = dto.Condition,
                IsActive = dto.IsActive
            };

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = item.ItemId }, item);
        }


        // PUT: api/Item/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Item item)
        {
            if (id != item.ItemId) return BadRequest();
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Item/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null) return NotFound();
            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
