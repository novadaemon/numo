# Database Schema

## concepts

| field | type        | nullable | index   |
| ----- | ----------- | -------- | ------- |
| id    | integer     | no       | primary |
| name  | varchar(50) | no       | unique  |

---

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

| field        | type          | nullable | index   | description                           |
| ------------ | ------------- | -------- | ------- | ------------------------------------- |
| id           | integer       | no       | primary | Unique identifier                     |
| category_id  | integer       | no       | index   | Reference to categories               |
| place_id     | integer       | no       | index   | Reference to places                   |
| concept      | varchar(255)  | yes      |         | Concept or description of the expense |
| created_at   | datetime      | no       |         | When the expense occurred             |
| amount       | decimal(10,2) | no       |         | Expense amount                        |
| method       | enum          | no       |         | Payment method (debit, credit, cash)  |
| observations | text          | yes      |         | Optional notes                        |

---

## credits

| field        | type          | nullable | index   | description              |
| ------------ | ------------- | -------- | ------- | ------------------------ |
| id           | integer       | no       | primary | Unique identifier        |
| created_at   | datetime      | no       |         | When the income occurred |
| amount       | decimal(10,2) | no       |         | Income amount            |
| observations | text          | yes      |         | Optional notes           |
