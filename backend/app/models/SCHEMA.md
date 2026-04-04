# Database Schema

## categories

| field | type        | nullable | index   |
| ----- | ----------- | -------- | ------- |
| id    | integer     | no       | primary |
| name  | varchar(50) | no       | unique  |

---

## places

| field | type         | nullable | index   |
| ----- | ------------ | -------- | ------- |
| id    | integer      | no       | primary |
| name  | varchar(100) | no       | unique  |

---

## debits

| field        | type          | nullable | index   | description               |
| ------------ | ------------- | -------- | ------- | ------------------------- |
| id           | integer       | no       | primary | Unique identifier         |
| category_id  | integer       | no       | index   | Reference to categories   |
| place_id     | integer       | yes      | index   | Reference to places       |
| created_at   | datetime      | no       |         | When the expense occurred |
| amount       | decimal(10,2) | no       |         | Expense amount            |
| concept      | varchar(255)  | no       |         | Expense concept/title     |
| observations | text          | yes      |         | Optional notes            |

---

## credits

| field        | type          | nullable | index   | description              |
| ------------ | ------------- | -------- | ------- | ------------------------ |
| id           | integer       | no       | primary | Unique identifier        |
| created_at   | datetime      | no       |         | When the income occurred |
| amount       | decimal(10,2) | no       |         | Income amount            |
| observations | text          | yes      |         | Optional notes           |
