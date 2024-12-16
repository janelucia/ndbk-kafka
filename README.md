# ndbk-kafka

Diese Applikation wurde für das Modul "Neue Datenbank-Konzepte" erstellt.

## Getting Started

### Prerequisites
```bash
  bun install
```

### Anwendung lokal starten

```bash
  bun dev
```

### Docker starten
```bash
  docker compose up
```

### Eingangs Topic Erstellen
```bash
  docker exec -it broker kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic posts
```

### Verbindung mit dem ksqlDB CLI herstellen
```bash
  docker exec -it ksqldb-cli ksql http://ksqldb-server:8088
```

Jetzt sollte man in einer ksqlDB CLI sein und kann die folgenden Befehle ausführen.

#### 1. Stream über 'Posts'-Topic erstellen
```sql
    CREATE OR REPLACE STREAM post_stream (did STRING, rkey STRING, text STRING, lang STRING)
    WITH (KAFKA_TOPIC='posts', VALUE_FORMAT='JSON');
```

#### 2. Aggregierte Tabelle erstellen, basierend auf dem Stream
```sql
CREATE OR REPLACE TABLE posts_aggregated AS
SELECT
    lang AS key,
    AS_VALUE(lang) AS lang,
    COUNT(*) AS post_count,
    SUM(LEN(text)) AS total_characters,
    AVG(LEN(text)) AS average_characters,
    WINDOWSTART AS window_start,
    WINDOWEND AS window_end
FROM post_stream
    WINDOW TUMBLING (SIZE 1 MINUTES)
GROUP BY lang
    EMIT CHANGES;
```

#### 3. Producer für Posts starten
```bash
  bun produce
```