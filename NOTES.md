# Implementation Notes

**Candidate:** [Tri Wulandari]  
**Date:** [01 Desember 2025]  
**Time Spent:** [180 hours / 3 days]

## Main Bugs/Issues Found

### 1. [TEST/TodoService]

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

### 2. [TEST/InMemoryTodoRepository]

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
  

### 3. [TEST/TodoService]

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

### 4. [create/TodoService]
**Issue:**
**Fix:**
**Impact:**

### 5. [processReminders/TodoService]
**Issue:**
- belum ada pengecekan PENDING ketika todo
**Fix:**
**Impact:**

### 6. [update/infra/InMemoryTodoRepository]
**Issue:**
- ketika update melakukan push data
**Fix:**
**Impact:**

### 7. [Bug Name/Location]
**Issue:**
**Fix:**
**Impact:**

### 8. [Bug Name/Location]
**Issue:**
**Fix:**
**Impact:**

### 9. [Bug Name/Location]
**Issue:**
**Fix:**
**Impact:**

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
- [ ] Integration Tests
- [v] API Documentation
- [ ] Health Check Endpoint
- [ ] Other: ******\_\_\_******

### Details

---

## Future Improvements

If I had more time, I would add/improve:

1.
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
