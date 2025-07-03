# 🔧 Hướng dẫn khắc phục lỗi GitHub Gist ID

## ❌ Vấn đề hiện tại
Website đang hiển thị lỗi "Cấu hình ứng dụng chưa đúng" vì Gist ID trong config.js không hợp lệ.

## ✅ Giải pháp: Tạo GitHub Gist mới

### Bước 1: Tạo GitHub Gist mới

1. **Truy cập** [gist.github.com](https://gist.github.com)
2. **Đăng nhập** vào tài khoản GitHub của bạn
3. **Tạo Gist mới** với thông tin sau:

**📁 Filename:** `puzzle_state.json`

**📝 Content:**
```json
{
  "isCompleted": false,
  "winner": null,
  "completedAt": null
}
```

4. **⚠️ QUAN TRỌNG:** Chọn **"Create public gist"** (KHÔNG chọn "Create secret gist")
5. **Click** "Create public gist"

### Bước 2: Lấy Gist ID

1. Sau khi tạo Gist, **copy URL** từ browser
2. URL sẽ có dạng: `https://gist.github.com/username/abc123def456789`
3. **Copy phần cuối** (ví dụ: `abc123def456789`) - đây chính là Gist ID

### Bước 3: Cập nhật config.js

1. **Mở file** `config.js`
2. **Tìm dòng:**
```javascript
gistId: "YOUR_GIST_ID_HERE", // REPLACE THIS with your actual Gist ID
```
3. **Thay thế** `YOUR_GIST_ID_HERE` bằng Gist ID mới của bạn:
```javascript
gistId: "abc123def456789", // Thay bằng ID Gist thực của bạn
```

### Bước 4: Kiểm tra kết quả

1. **Reload** trang web
2. Website sẽ hiển thị puzzle game thay vì thông báo lỗi
3. Nếu vẫn lỗi, kiểm tra:
   - Gist có được tạo ở chế độ Public không?
   - Gist ID có chính xác không?
   - File trong Gist có tên đúng `puzzle_state.json` không?

## 🆘 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
- Console log trong Developer Tools (F12)
- Đảm bảo internet connection ổn định
- Thử tạo Gist mới nếu vẫn lỗi