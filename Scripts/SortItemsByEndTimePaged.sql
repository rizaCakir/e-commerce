CREATE OR REPLACE FUNCTION SortItemsByEndTimePaged(
    sort_desc BOOLEAN,
    limit_count INT,
    offset_count INT
)
RETURNS TABLE (
    ItemId INT,
    Title TEXT,
    Description TEXT,
    CurrentPrice NUMERIC,
    EndTime TIMESTAMPTZ,
    IsActive BOOLEAN
) AS $$
BEGIN
    IF sort_desc THEN
        RETURN QUERY
SELECT "ItemId", "Title", "Description", "CurrentPrice", "EndTime", "IsActive"
FROM "Items"
WHERE "IsActive" = TRUE
ORDER BY "EndTime" DESC
    LIMIT limit_count OFFSET offset_count;
ELSE
        RETURN QUERY
SELECT "ItemId", "Title", "Description", "CurrentPrice", "EndTime", "IsActive"
FROM "Items"
WHERE "IsActive" = TRUE
ORDER BY "EndTime" ASC
    LIMIT limit_count OFFSET offset_count;
END IF;
END;
$$ LANGUAGE plpgsql;