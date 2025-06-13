CREATE OR REPLACE FUNCTION SortItemsByCurrentPrice(
    sort_desc BOOLEAN
)
RETURNS TABLE (
    ItemId INT,
    Title TEXT,
    Description TEXT,
    CurrentPrice NUMERIC,
    EndTime TIMESTAMP,
    IsActive BOOLEAN
) AS $$
BEGIN
    IF sort_desc THEN
        RETURN QUERY
SELECT ItemId, Title, Description, CurrentPrice, EndTime, IsActive
FROM Items
WHERE IsActive = TRUE
ORDER BY CurrentPrice DESC;
ELSE
        RETURN QUERY
SELECT ItemId, Title, Description, CurrentPrice, EndTime, IsActive
FROM Items
WHERE IsActive = TRUE
ORDER BY CurrentPrice ASC;
END IF;
END;
$$ LANGUAGE plpgsql;
