FROM postgres:16-alpine

ENV POSTGRES_DB=bankcalls \
    POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres

COPY db/schema.sql /docker-entrypoint-initdb.d/10-schema.sql
COPY db/sample_data.sql /docker-entrypoint-initdb.d/20-sample-data.sql

# Optional: append more SQL or shell scripts into /docker-entrypoint-initdb.d
# to customize initialization (e.g., simulate follow-up calls).
