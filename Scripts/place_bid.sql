CREATE OR REPLACE PROCEDURE place_bid(_user_id INT, _item_id INT, _amount DECIMAL)
LANGUAGE plpgsql
AS $$
DECLARE
_prev_user_id INT;
    _prev_bid_amount DECIMAL;
BEGIN
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

    IF EXISTS (
        SELECT 1 FROM "VirtualCurrencies"
        WHERE "UserId" = _user_id AND "Amount" >= _amount
    ) THEN
UPDATE "VirtualCurrencies"
SET "Amount" = "Amount" - _amount
WHERE "UserId" = _user_id;

INSERT INTO "Bids" ("UserId", "ItemId", "Amount", "CreatedAt")
VALUES (_user_id, _item_id, _amount, NOW());

UPDATE "Items"
SET "CurrentPrice" = _amount
WHERE "ItemId" = _item_id;
ELSE
        RAISE EXCEPTION 'Insufficient balance for user %', _user_id;
END IF;
END;
$$;
