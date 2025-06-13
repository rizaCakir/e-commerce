CREATE OR REPLACE PROCEDURE finalize_single_auction(_item_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
_buyer_id INT;
    _seller_id INT;
    _amount DECIMAL;
BEGIN
    -- Ürün aktif ve süresi geçmiş mi kontrol et
SELECT "UserId"
INTO _seller_id
FROM "Items"
WHERE "ItemId" = _item_id AND "IsActive" = TRUE AND "EndTime" <= NOW();

IF NOT FOUND THEN
        -- Ürün ya yok ya da zaten kapatılmış
        RETURN;
END IF;

    -- En yüksek teklifi bul
SELECT "UserId", "Amount"
INTO _buyer_id, _amount
FROM "Bids"
WHERE "ItemId" = _item_id
ORDER BY "Amount" DESC
    LIMIT 1;

-- Eğer teklif varsa işlem yap
IF FOUND THEN
        -- Alıcının bakiyesi yeterli mi?
        IF EXISTS (
            SELECT 1 FROM "VirtualCurrencies"
            WHERE "UserId" = _buyer_id AND "Amount" >= _amount
        ) THEN
            -- Alıcının bakiyesinden düş
UPDATE "VirtualCurrencies"
SET "Amount" = "Amount" - _amount
WHERE "UserId" = _buyer_id;

-- Satıcıya ödeme yap
UPDATE "VirtualCurrencies"
SET "Amount" = "Amount" + _amount
WHERE "UserId" = _seller_id;

-- Transaction kaydı oluştur
INSERT INTO "Transactions" ("BuyerId", "SellerId", "ItemId", "Price", "Date")
VALUES (_buyer_id, _seller_id, _item_id, _amount, NOW());

-- Ürünü pasifleştir ve fiyatı güncelle
UPDATE "Items"
SET "IsActive" = FALSE, "CurrentPrice" = _amount
WHERE "ItemId" = _item_id;
END IF;
ELSE
        -- Teklif yoksa sadece pasifleştir
UPDATE "Items"
SET "IsActive" = FALSE
WHERE "ItemId" = _item_id;
END IF;
END;
$$;
