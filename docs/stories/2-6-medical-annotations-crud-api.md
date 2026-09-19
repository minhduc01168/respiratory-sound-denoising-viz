# Story 2.6: Medical Annotations CRUD API

- **Story ID:** `2.6`
- **Story Key:** `2-6-medical-annotations-crud-api`
- **Epic:** `Epic 2: Dịch Vụ Backend FastAPI & Tầng Dữ Liệu Y Tế`
- **Story Points:** 2
- **Priority:** P0 (Critical)
- **Status:** done

---

## 1. User Story
> **Là một** Bác sĩ / Chuyên gia y tế,  
> **Tôi muốn** các endpoint API để tạo mới (`POST`), truy vấn danh sách (`GET`) và xóa (`DELETE`) các ghi chú lâm sàng (annotations) gắn với từng khoảng thời gian bệnh lý trên bản ghi âm hô hấp,  
> **Để** lưu vết chẩn đoán (ví dụ: phát hiện tiếng rít Wheeze ở giây 1.2s - 2.8s) phục vụ hội chẩn và báo cáo bệnh án.

---

## 2. Acceptance Criteria (Gherkin BDD)

### Scenario 1: Tạo ghi chú y khoa mới thành công
- **Given:** Một bản ghi âm đã xử lý với `audio_id` hợp lệ.
- **When:** Gửi request `POST /api/annotations` với body `{ audio_id, start_time: 1.2, end_time: 2.8, tag: "Wheeze", note: "Tiếng rít thì thở ra, nghi hen phế quản" }`.
- **Then:** Trả về HTTP 201 Created chứa `id`, `audio_id`, `start_time`, `end_time`, `tag`, `note`, `created_at`. Dữ liệu được lưu vào SQLite.

### Scenario 2: Validate thời gian ghi chú bất hợp lệ
- **Given:** Request tạo ghi chú có `start_time >= end_time` hoặc `start_time < 0`.
- **When:** Gửi request `POST /api/annotations`.
- **Then:** Trả về HTTP 422 Unprocessable Entity hoặc HTTP 400 Bad Request kèm thông báo lỗi cụ thể.

### Scenario 3: Lấy danh sách ghi chú theo `audio_id`
- **Given:** Bản ghi âm đã có 2 ghi chú được lưu trong hệ thống.
- **When:** Gửi request `GET /api/annotations/{audio_id}`.
- **Then:** Trả về HTTP 200 OK với danh sách mảng JSON gồm các ghi chú được sắp xếp theo `start_time` tăng dần.

### Scenario 4: Xóa ghi chú lâm sàng thành công
- **Given:** Một `annotation_id` đã tồn tại trong database.
- **When:** Gửi request `DELETE /api/annotations/{annotation_id}`.
- **Then:** Trả về HTTP 200 OK `{ "message": "Ghi chú đã được xóa thành công", "id": annotation_id }`. Bản ghi không còn tồn tại trong SQLite.

### Scenario 5: Xóa ghi chú không tồn tại
- **Given:** Một `annotation_id` không tồn tại.
- **When:** Gửi request `DELETE /api/annotations/{annotation_id}`.
- **Then:** Trả về HTTP 404 Not Found kèm thông báo lỗi rõ ràng.

---

## 3. Architecture & Developer Guardrails
- **Database Layer:** Sử dụng `create_annotation`, `get_annotations_by_audio_id`, `delete_annotation` từ `backend/app/core/database.py`.
- **Pydantic Schemas:** Sử dụng `AnnotationCreate`, `AnnotationResponse` từ `backend/app/models/schemas.py`.
- **FastAPI Router:** Tạo mới file `backend/app/api/routes_annotation.py` và include vào `backend/app/main.py`.
- **Unit Tests:** `backend/tests/test_api_annotation.py`.
