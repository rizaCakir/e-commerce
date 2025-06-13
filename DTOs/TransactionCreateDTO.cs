namespace ebeytepe.Dtos
{
    public class TransactionCreateDto
    {
        public int BuyerId { get; set; }
        public int SellerId { get; set; }
        public int ItemId { get; set; }
        public decimal Price { get; set; }
    }
}