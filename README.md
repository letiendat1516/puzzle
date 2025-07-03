"# 🧩 Puzzle Game - Giải đố có thưởng

Một ứng dụng web giải đố với tính năng tự động xác định người chiến thắng đầu tiên và lưu trạng thái qua GitHub Gist.

## 🌟 Tính năng chính

- **🏆 Chỉ người đầu tiên giải đúng mới được thưởng**
- **🔄 Tự động chuyển trạng thái "Đã được giải" sau khi có người thắng**
- **🚀 Deploy tự động trên GitHub Pages**
- **💾 Sử dụng GitHub Gist để lưu trạng thái người chiến thắng**
- **🔒 Bảo mật đáp án bằng mã hóa Base64**
- **📱 Giao diện responsive, thân thiện với mobile**
- **🎨 UI/UX hiện đại với màu sắc xanh dương chủ đạo**

## 🚀 Demo

[Xem demo trực tiếp](https://letiendat1516.github.io/puzzle)

## 📁 Cấu trúc dự án

```
puzzle/
├── index.html              # Giao diện chính
├── style.css               # Stylesheet với thiết kế responsive
├── script.js               # Logic chính của ứng dụng
├── config.js               # Cấu hình câu đố và đáp án
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions để deploy
└── README.md               # Tài liệu hướng dẫn
```

## 🛠️ Cài đặt và triển khai

### Bước 1: Fork repository này

1. Click nút "Fork" ở góc trên bên phải
2. Chọn tài khoản GitHub của bạn

### Bước 2: Tạo GitHub Gist để lưu trạng thái

1. Truy cập [gist.github.com](https://gist.github.com)
2. Tạo một Gist mới với:
   - **Filename**: `puzzle_state.json`
   - **Content**: 
   ```json
   {
     "isCompleted": false,
     "winner": null,
     "completedAt": null
   }
   ```
3. Đặt Gist ở chế độ **Public**
4. Click "Create public gist"
5. Copy ID của Gist từ URL (phần sau gist.github.com/)

### Bước 3: Cấu hình ứng dụng

1. Mở file `config.js`
2. Thay đổi `YOUR_GIST_ID_HERE` thành ID Gist bạn vừa tạo:
   ```javascript
   github: {
       gistId: "abc123def456", // Thay bằng ID Gist của bạn
       filename: "puzzle_state.json",
       // ...
   }
   ```

### Bước 4: Tùy chỉnh câu đố (tùy chọn)

1. Mở file `config.js`
2. Thay đổi câu hỏi:
   ```javascript
   puzzle: {
       question: "Câu hỏi mới của bạn?",
       encodedAnswer: "BASE64_ENCODED_ANSWER",
       prizeAmount: "200,000 VNĐ",
       // ...
   }
   ```

**Để mã hóa đáp án:**
1. Truy cập [base64encode.org](https://www.base64encode.org)
2. Nhập đáp án của bạn
3. Click "Encode"
4. Copy kết quả vào `encodedAnswer`

### Bước 5: Bật GitHub Pages

1. Vào **Settings** của repository
2. Chọn **Pages** ở sidebar
3. Trong **Source**, chọn **GitHub Actions**
4. Repository sẽ được deploy tự động khi bạn push code

## 🎮 Cách sử dụng

### Cho người chơi:
1. Truy cập trang web
2. Đọc câu đố
3. Điền thông tin: Tên, Email, Đáp án
4. Click "Gửi đáp án"
5. Nếu đúng và là người đầu tiên → Chúc mừng!
6. Nếu đúng nhưng không phải người đầu tiên → Thông báo đã có người thắng

### Cho admin:
- Theo dõi trạng thái qua GitHub Gist
- Thay đổi câu đố trong `config.js`
- Reset game bằng cách cập nhật Gist về trạng thái ban đầu

## 🔧 Cấu hình nâng cao

### Thay đổi thời gian chờ:
```javascript
ui: {
    loadingTimeout: 5000,    // Thời gian chờ tải (ms)
    messageTimeout: 5000,    // Thời gian hiển thị thông báo (ms)
    animationDuration: 300   // Thời gian animation (ms)
}
```

### Cài đặt bảo mật:
```javascript
security: {
    allowedChars: /^[a-zA-Z0-9\s\u00C0-\u1EF9@._-]+$/,
    submissionCooldown: 3000 // Thời gian chờ giữa các lần gửi (ms)
}
```

### Cài đặt retry cho API:
```javascript
github: {
    maxRetries: 3,      // Số lần thử lại
    retryDelay: 1000    // Thời gian chờ giữa các lần thử (ms)
}
```

## 🎨 Tùy chỉnh giao diện

### Thay đổi màu chủ đạo:
Mở `style.css` và thay đổi:
```css
:root {
    --primary-color: #007bff;    /* Màu xanh dương */
    --success-color: #28a745;    /* Màu xanh lá */
    --danger-color: #dc3545;     /* Màu đỏ */
    --warning-color: #ffc107;    /* Màu vàng */
}
```

### Thêm animation:
```css
.custom-animation {
    animation: customEffect 1s ease-in-out;
}

@keyframes customEffect {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}
```

## 🔍 Troubleshooting

### Lỗi "Cấu hình ứng dụng chưa đúng"
- Kiểm tra `gistId` trong `config.js`
- Đảm bảo Gist được đặt ở chế độ Public
- Kiểm tra format của `puzzle_state.json`

### Lỗi "Không thể kiểm tra trạng thái game"
- Kiểm tra kết nối internet
- Kiểm tra GitHub API có hoạt động không
- Kiểm tra Gist ID có đúng không

### Lỗi "Đáp án không chính xác" khi đáp án đúng
- Kiểm tra encoding của đáp án
- So sánh đáp án gốc với kết quả decode
- Đảm bảo không có ký tự thừa

### Game không reset sau khi có winner
- Cập nhật Gist về trạng thái ban đầu:
  ```json
  {
    "isCompleted": false,
    "winner": null,
    "completedAt": null
  }
  ```

## 📊 Theo dõi và phân tích

### Xem lịch sử người chơi:
1. Truy cập Gist của bạn
2. Click tab "Revisions"
3. Xem các thay đổi theo thời gian

### Export dữ liệu:
```javascript
// Chạy trong console browser
const state = JSON.parse(localStorage.getItem('puzzleGameState'));
console.log('Current state:', state);
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Mở Pull Request

## 📄 License

Dự án này sử dụng MIT License. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🙏 Acknowledgments

- [Font Awesome](https://fontawesome.com) cho icons
- [GitHub API](https://docs.github.com/en/rest) cho storage
- [GitHub Pages](https://pages.github.com) cho hosting

## 📞 Liên hệ

Nếu bạn có câu hỏi hoặc cần hỗ trợ, vui lòng tạo [Issue](https://github.com/letiendat1516/puzzle/issues) mới.

---

**Chúc bạn tạo được những câu đố thú vị! 🎉**" 
