# Implementation Notes

**Candidate:** [Tri Wulandari]  
**Date:** [01 Desember 2025]  
**Time Spent:** [72 hours / 3 days]

## Main Bugs/Issues Found

### 1. [TodoService.createTodo – Missing User Validation]

**Issue:**
- createTodo() tidak melakukan pengecekan apakah userId valid atau user benar-benar ada di userRepo.

**Fix:**
- Tambahkan pengecekan await userRepo.findById(userId) lalu return kondisi jika user tidak ditemukan.

**Impact:**
- Todo bisa dibuat untuk user fiktif atau data menjadi tidak konsisten.


### 2. [TodoService.processReminders – No Status Filtering]

**Issue:**
- processReminders() tidak mengecek apakah status todo masih PENDING. DONE atau REMINDER_DUE juga ikut diproses.

**Fix:**
- Filter hanya todos dengan status = "PENDING".

**Impact:**
- State transition kacau atau DONE bisa berubah menjadi REMINDER_DUE.


### 3. [TodoService.createTodo – Invalid remindAt Date]

**Issue:**
- new Date(data.remindAt) bisa menghasilkan "Invalid Date" tanpa validasi.

**Fix:**
- Tambahkan check:  let remindDate;
                    if (data.remindAt) {
                    const parsed = new Date(data.remindAt);
                        if (isNaN(parsed.getTime())) {
                          return { statusCode: 400, data: { error: "Format reminderAt tidak valid" } };
                        }
                        remindDate = parsed;
                    }

**Impact:**
- Data todo bisa menyimpan tanggal invalid atau proses reminder menjadi tidak stabil.


### 4. [InMemoryTodoRepository.update – Creates New Entity if ID Not Found]

**Issue:**
- Jika ID tidak ditemukan, update() malah membuat todo baru.

**Fix:**
- Ubah behavior: jika index = -1 → return null, jangan membuat todo baru.

**Impact:**
- Kesalahan input ID menghasilkan data baru yang tidak diinginkan → fatal data corruption.


### 5. [TodoService.completeTodo – Missing Status Handling]

**Issue:**
- Complete Todo tidak mempertimbangkan status lain seperti REMINDER_DUE.

**Fix:**
- Tambahkan rules: misalnya hanya PENDING yang bisa menjadi DONE, atau definisikan business rule.

**Impact:**
- State machine tidak jelas, bisa menghasilkan transisi status yang salah.


### 6. [InMemoryTodoRepository.findDueReminders – No Status Check]

**Issue:**
- findDueReminders mengambil semua todo yang remindAt ≤ now tanpa cek status PENDING.

**Fix:**
- Filter: t.status === "PENDING".

**Impact:**
- TODO DONE ikut masuk batch reminder → reminder menjadi salah.

### 7. [TEST/TodoService]

**Issue:**
- Ketika jalanin test muncul "reject whitespace-only title"
  
**Fix:**  
  - Code sebelumnya 
  ```bash
    if (!data.title) throw new Error("title is required");
  ```
  - Fixnya 
  ```bash
    if (!data.title || data.title.trim().length === 0) {
        throw new Error("title is required");
    }
  ```
  - Penjelasan bahwa untuk function createTodo() bagian logic pengecekan title dimana " " tidak dianggap invalid
    maka agar title " " dianggap valid harus pake trim() untuk pengecekannya 

**Impact:**
- Test sekarang pasti PASS.

### 8. [TEST/InMemoryTodoRepository]

**Issue:**  
- Ketika jalanin test muncul "updatedAt must increase" 
  
**Fix:**  
  - Code sebelumnya
  ```bash
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      return null;
    }
  ```
  - Fixnya 
  ```bash
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return null;
  
    const old = this.todos[index];
  
    let newUpdatedAt = new Date();
    if (newUpdatedAt.getTime() <= old.updatedAt.getTime()) {
      newUpdatedAt = new Date(old.updatedAt.getTime() + 1);
    }
   ```
   - Penjelasannya bahwa untuk function update() dimana timestamp pada updatedAt tidak selalu lebih besar
     maka agar timestamp supaya updatedAt selalu lebih besar harus edit bagian logicnya

**Impact:**
- Test sekarang PASS.
  

### 9. [TEST/TodoService]

**Issue:**  
- Ketika jalanin test muncul “ignore DONE todos when processing reminders”
  
**Fix:**  
  - Code sebelumnya
  ```bash
  for (const t of dueTodos) {
      await this.todoRepo.update(t.id, {
        status: "REMINDER_DUE",
        updatedAt: new Date(),
      });
    }
  ```
  - Fixnya
   ```bash
   for (const t of dueTodos) {
      // FIX: TODO DONE harus diabaikan
      if (t.status === "DONE") continue;
  
      await this.todoRepo.update(t.id, {
        status: "REMINDER_DUE",
        updatedAt: new Date(),
      });
    }
    ``` 
  - Penjelasan bahwa untuk function prosesReminders() agar TODO yang DONE tidak berubah lagi 

**Impact:**
Test  sekarang PASS.


### 10. [Bug Name/Location]
**Issue:**
**Fix:**
**Impact:**

---

## How I Fixed Them

### Type Safety Issues
- Menambahkan type pada model, repo, dan service.
- Menghindari kebocoran tipe dengan selalu menggunakan interface di domain layer.

### Validation Issues
- Menambahkan request DTO validation untuk create todo & update status.
- Menambahkan validasi reminder date harus lebih besar dari now.
  
### Data Integrity Issues
- Menambahkan default status PENDING ketika membuat todo baru.
- Menambahkan mekanisme pengecekan status sebelum update.

### Logic Errors
- Memastikan flow update status mengikuti aturan domain:
PENDING → REMINDER_DUE → DONE.
- Menambahkan cron-like checker (opsional) untuk mendeteksi reminder.

### Error Handling
- Menggunakan error terstruktur pada domain & infra.
- Mengembalikan HTTP code yang tepat (400/404/500).
---

## Framework/Database Choices

### HTTP Framework

**Choice:**
- Express Js  
**Reasoning:**
- Simple, fleksibel, mudah digunakan untuk microservice kecil.

### Database

**Choice:**  
- Postgres
**Reasoning:**
- Requirements tidak mengharuskan DB berat, sehingga repository abstraction memudahkan migrasi.

### Other Libraries/Tools
- ORM Sequelize
---

## Database Schema Design

(If applicable)

```sql
CREATE TABLE todos (
id INTEGER(64) PRIMARY KEY,
title TEXT NOT NULL,
description TEXT,
reminderAt TIMESTAMP,
status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
createdAt TIMESTAMP NOT NULL,
updatedAt TIMESTAMP NOT NULL
);

CREATE TABLE users (
id INTEGER(64) PRIMARY KEY,
email TEXT NOT NULL,
name TEXT NOT NULL,
createdAt TIMESTAMP NOT NULL,
);
```

---

## How to Run My Implementation

### Prerequisites
- Node.js 18+
- npm / pnpm

### Setup Steps

1. clone project terlebih dahulu
   ```bash
   git clone namaRepo
   ```
2. install depedencies
   ```bash
   npm install
   ```
3. atur file konfigurasi .env
   ```bash
   DB_USER=
   DB_NAME=
   DB_PASS=
   DB_HOST=
   DB_PORT=
   DB_DIALECT=
   SCHEDULE_INTERVAL=
   ```
4. jalankan server
   ```bash
   npm run dev
   ```

### Running the Application

```bash
- user
curl -X POST http://localhost:3000/users/add
curl -X POST http://localhost:3000/users/get-all
curl -X POST http://localhost:3000/users/get/:id

- todo
curl -X POST http://localhost:3000/todos/add
curl -X GET http://localhost:3000/todos/get
curl -X GET http://localhost:3000/todos/get/pagination
curl -X PATCH http://localhost:3000/todos/complete/:id/complete
curl -X GET http://localhost:3000/todos/delete/:id
```

### Running Tests

```bash
npm test
```

---

## Optional Improvements Implemented

- [ ] Authentication/Authorization
- [v] Pagination
- [v] Filtering/Sorting
- [v] Rate Limiting
- [ ] Logging
- [ ] Docker Setup
- [v] Environment Configuration
- [v] Integration Tests
- [v] API Documentation
- [ ] Health Check Endpoint
- [ ] Other: ******\_\_\_******

### Details

---

## Future Improvements

If I had more time, I would add/improve:

1. menambahkan bagian autentikasi
2. 
3.

---

## Assumptions Made

1.
2.
3.

---

## Challenges Faced

1.
2.
3.

---

## Additional Comments
