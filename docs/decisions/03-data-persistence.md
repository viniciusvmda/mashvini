# 03 - Data persistence

- Database over file to address ACID transactions since SQL databases address it out of the box.
- SQL over NoSQL to cover the ACID requirement and because we have structured relational data that fits better in SQL: order -> order item -> catalog item -> catalog.
- Postgres over MySQL and SQL Server since Postgres is open-source like MySQL, unlike SQL Server, and Postgres's DDL runs transactionally (a failed migration rolls back cleanly) while MySQL's DDL mostly auto-commits. Postgres also has `JSONB` if we need less structured data in the future (e.g., adding dynamic fields for catalog items).