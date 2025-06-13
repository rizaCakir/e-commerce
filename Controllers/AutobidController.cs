using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ebeytepe.Data;
using ebeytepe.Models;
using System.Linq;
using System.Threading.Tasks;
using ebeytepe.DTOs;

namespace ebeytepe.Controllers
{


    [ApiController]
    [Route("api/[controller]")]
    public class AutobidController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AutobidController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAutobid([FromBody] AutobidCreateDto dto)
        {
            // Yeni autobid ekle
            var autobid = new Autobid
            {
                UserId = dto.UserId,
                ItemId = dto.ItemId,
                MaxBid = dto.MaxBid,
                Increment = dto.Increment
            };

            _context.Autobids.Add(autobid);
            await _context.SaveChangesAsync();

            // Otomatik teklifleri tetikle (senin verdiğin kod)
            var autobids = await _context.Autobids
                .Include(ab => ab.User)
                .Where(ab => ab.ItemId == dto.ItemId && ab.UserId != dto.UserId)
                .ToListAsync();

            foreach (var ab in autobids)
            {
                var lastBid = await _context.Bids
                    .Where(b => b.ItemId == ab.ItemId)
                    .OrderByDescending(b => b.Amount)
                    .FirstOrDefaultAsync();

                if (lastBid != null &&
                    lastBid.UserId != ab.UserId &&
                    lastBid.Amount + ab.Increment <= ab.MaxBid)
                {
                    var newBid = new Bid
                    {
                        Amount = lastBid.Amount + ab.Increment,
                        ItemId = ab.ItemId,
                        UserId = ab.UserId,
                    };

                    _context.Bids.Add(newBid);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(autobid);
        }



        [HttpGet("{itemId}")]
        public async Task<IActionResult> GetAutobidsForItem(int itemId)
        {
            var autobids = await _context.Autobids
                .Where(ab => ab.ItemId == itemId)
                .Include(ab => ab.User)
                .Select(ab => new
                {
                    ab.UserId,
                    ab.User.Name,
                    ab.MaxBid
                })
                .ToListAsync();

            return Ok(autobids);
        }
    }
}

