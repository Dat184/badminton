<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project: app cầu lông

App lên lịch đánh cầu lông và chia tiền (sân, nước, cầu) cho cả nhóm. Next.js 16 (App Router) + Tailwind v4, deploy lên Vercel. UI tiếng Việt.

### Cấu trúc thư mục

```
src/
  app/            Chỉ chứa routing: page, layout, loading, error, route. Giữ mỏng, gọi xuống features/.
  components/ui/  Component giao diện dùng chung, không biết gì về nghiệp vụ (Button, Input, Card...).
  features/<tên>/ Mỗi tính năng một thư mục (vd: groups, sessions, billing), gồm component,
                  server action và logic riêng của tính năng đó.
  lib/            Hàm thuần dùng chung, không phụ thuộc React hay DB (format tiền, ngày...).
  server/         Code chỉ chạy phía server: kết nối DB, truy vấn. Không import từ client component.
public/           File tĩnh (icon, ảnh).
```

### Quy ước

- Import qua alias `@/` (trỏ vào `src/`), ví dụ `import { formatVND } from "@/lib/money"`.
- Tiền luôn là số nguyên VND, chỉ format khi hiển thị (`formatVND`).
- Logic tính/chia tiền viết thành hàm thuần và có test; test đặt cạnh file, tên `*.test.ts`.
- Lệnh: `npm run dev`, `npm test` (watch), `npm run test:run`, `npm run lint`, `npm run typecheck`, `npm run format`.
