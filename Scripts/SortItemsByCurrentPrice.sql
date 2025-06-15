DROP FUNCTION IF EXISTS SortItemsByCurrentPrice(BOOLEAN, INT, INT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION SortItemsByCurrentPrice(
    sort_desc BOOLEAN,
    limit_count INT,
    offset_count INT,
    category_filter TEXT,
    condition_filter TEXT
)
RETURNS TABLE (
    ItemId INT,
    UserId INT,
    Title TEXT,
    Description TEXT,
    Category TEXT,
    StartingPrice NUMERIC,
    CurrentPrice NUMERIC,
    BuyoutPrice NUMERIC,
    StartTime TIMESTAMPTZ,
    EndTime TIMESTAMPTZ,
    Image TEXT,
    Condition TEXT,
    IsActive BOOLEAN
) AS $$
BEGIN
    IF sort_desc THEN
        RETURN QUERY
SELECT
    "ItemId",
    "UserId",
    "Title",
    "Description",
    "Category",
    "StartingPrice",
    "CurrentPrice",
    "BuyoutPrice",
    "StartTime",
    "EndTime",
    "Image",
    "Condition",
    "IsActive"
FROM "Items"
WHERE "IsActive" = TRUE
  AND (category_filter = 'All' OR "Category" = category_filter)
  AND (condition_filter = 'All' OR "Condition" = condition_filter)
ORDER BY "CurrentPrice" DESC
    LIMIT limit_count OFFSET offset_count;
ELSE
        RETURN QUERY
SELECT
    "ItemId",
    "UserId",
    "Title",
    "Description",
    "Category",
    "StartingPrice",
    "CurrentPrice",
    "BuyoutPrice",
    "StartTime",
    "EndTime",
    "Image",
    "Condition",
    "IsActive"
FROM "Items"
WHERE "IsActive" = TRUE
  AND (category_filter = 'All' OR "Category" = category_filter)
  AND (condition_filter = 'All' OR "Condition" = condition_filter)
ORDER BY "CurrentPrice" ASC
    LIMIT limit_count OFFSET offset_count;
END IF;
END;
$$ LANGUAGE plpgsql;
