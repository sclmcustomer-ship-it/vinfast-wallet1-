-- SQL: Fix Bank Cards - Hiển thị Full Số Tài Khoản

-- ⚠️ LƯU Ý: Script này chỉ update FORMAT hiển thị
-- Nếu số tài khoản GỐC đã bị che trong DB thì KHÔNG thể khôi phục

-- 1. Kiểm tra bank cards hiện tại
SELECT 
  id, 
  full_name, 
  linked_banks 
FROM users 
WHERE linked_banks IS NOT NULL 
  AND linked_banks::text LIKE '%****%';

-- 2. Nếu thấy có thẻ bị che, cần phải:
-- OPTION A: User thêm lại thẻ mới (khuyến nghị)
-- OPTION B: Nếu có số tài khoản đầy đủ, update thủ công:

-- Example: Update cho user cụ thể
-- UPDATE users 
-- SET linked_banks = '[
--   {
--     "id": "Agribank-0123456789",
--     "displayName": "Agribank - 0123456789",
--     "value": "0123456789",
--     "isDefault": true
--   }
-- ]'::jsonb
-- WHERE id = 'USER_ID_HERE';

-- 3. Verify sau khi update
SELECT 
  id,
  full_name,
  linked_banks
FROM users
WHERE linked_banks IS NOT NULL;
