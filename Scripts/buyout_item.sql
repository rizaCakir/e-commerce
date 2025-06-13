CREATE OR REPLACE PROCEDURE buyout_item(_user_id INT, _item_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
_price DECIMAL;
    _prev_user_id INT;
    _prev_bid_amount DECIMAL;
    _sellerid INT;
BEGIN
    -- Ürünün fiyat ve sahibini al
SELECT "BuyoutPrice", "UserId"
INTO _price, _sellerid
FROM "Items"
WHERE "ItemId" = _item_id AND "IsActive" = TRUE;

IF _price IS NULL THEN
        RAISE EXCEPTION 'This item is not available for buyout.';
END IF;

    -- Önceki en yüksek teklifi al ve varsa iade et
SELECT "UserId", "Amount"
INTO _prev_user_id, _prev_bid_amount
FROM "Bids"
WHERE "ItemId" = _item_id
ORDER BY "Amount" DESC
    LIMIT 1;

IF _prev_user_id IS NOT NULL THEN
UPDATE "VirtualCurrencies"
SET "Amount" = "Amount" + _prev_bid_amount
WHERE "UserId" = _prev_user_id;
END IF;

    -- Alıcının bakiyesi yeterli mi kontrol et
    IF EXISTS (
        SELECT 1 FROM "VirtualCurrencies"
        WHERE "UserId" = _user_id AND "Amount" >= _price
    ) THEN
        -- Alıcının bakiyesinden düş
UPDATE "VirtualCurrencies"
SET "Amount" = "Amount" - _price
WHERE "UserId" = _user_id;

-- Satıcıya ödeme yap
UPDATE "VirtualCurrencies"
SET "Amount" = "Amount" + _price
WHERE "UserId" = _sellerid;

-- Transaction kaydını oluştur
INSERT INTO "Transactions" ("BuyerId", "SellerId", "ItemId", "Price", "Date")
VALUES (_user_id, _sellerid, _item_id, _price, NOW());

-- Ürünü pasifleştir
UPDATE "Items"
SET "IsActive" = FALSE, "CurrentPrice" = _price
WHERE "ItemId" = _item_id;
ELSE
        RAISE EXCEPTION 'Insufficient balance for buyout.';
END IF;
END;
$$;
