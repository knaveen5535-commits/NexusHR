-- 1. Copy all existing values from `title` into `designation_name` where `designation_name` is NULL.
UPDATE designations 
SET designation_name = title 
WHERE designation_name IS NULL AND title IS NOT NULL;

-- 2. (Optional check) Ensure no data is lost and `designation_name` is populated.
-- You can run `SELECT * FROM designations;` manually to verify before proceeding to drop the column.

-- 3. Drop the obsolete `title` column.
ALTER TABLE designations 
DROP COLUMN title;
