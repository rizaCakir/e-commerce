using ebeytepe.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

public class ItemSchedulerService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ItemSchedulerService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var items = await dbContext.Items
            .Where(i => i.IsActive && i.EndTime > DateTime.UtcNow)
            .ToListAsync(stoppingToken);

        foreach (var item in items)
        {
            // Her item için zamanlayıcı başlat
            _ = ScheduleFinalization(item.ItemId, item.EndTime, stoppingToken);
        }
    }

    private async Task ScheduleFinalization(int itemId, DateTime endTime, CancellationToken token)
    {
        var delay = endTime - DateTime.UtcNow;

        if (delay.TotalMilliseconds <= 0)
        {
            Console.WriteLine($"[DEBUG] Item {itemId} already expired, finalizing immediately.");
        }
        else
        {
            Console.WriteLine($"[DEBUG] Scheduling item {itemId} to finalize in {delay.TotalSeconds} seconds.");
            try
            {
                await Task.Delay(delay, token);
            }
            catch (TaskCanceledException)
            {
                Console.WriteLine($"[DEBUG] Task for item {itemId} cancelled.");
                return;
            }
        }

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            Console.WriteLine($"[DEBUG] Calling procedure for item {itemId} at {DateTime.UtcNow}");
            await dbContext.Database.ExecuteSqlRawAsync(
                $"CALL finalize_single_auction({itemId});", cancellationToken: token);

            Console.WriteLine($"[DEBUG] Finalization procedure executed for item {itemId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Finalization failed for item {itemId}: {ex.Message}");
        }
    }
}
