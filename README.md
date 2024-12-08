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
  docker exec -it broker kafka-topics --create --bootstrap-server localhost:29092 --replication-factor 1 --partitions 1 --topic likes
```

### Verbindung mit dem ksqlDB CLI herstellen
```bash
  docker exec -it ksqldb-cli ksql http://ksqldb-server:8088
```

Jetzt sollte man in einer ksqlDB CLI sein und kann die folgenden Befehle ausführen.

#### 1. Stream über 'Likes'-Topic erstellen
```sql
    CREATE STREAM likes_stream (post_id STRING)
    WITH (KAFKA_TOPIC='likes', VALUE_FORMAT='JSON');
```

#### 2. Aggregierte Tabelle erstellen, basierend auf dem Stream
```sql
    CREATE TABLE likes_aggregated AS
    SELECT post_id AS post_id,
    COUNT(*) AS like_count
    FROM likes_stream
    WINDOW TUMBLING (SIZE 10 MINUTES)
    GROUP BY post_id
    EMIT CHANGES;
```

#### NICHT BENÖTIGT 3. Daten von der aggregierten Tabelle in ein neues Kafka-Topic streamen
```sql
    CREATE STREAM likes_aggregated_stream (post_id VARCHAR, like_count BIGINT) WITH (kafka_topic='likes_aggregated_topic', value_format='json');
```

```json
{
  "type": "object",
  "title": "Likes",
  "description": "Json schema for Likes",
  "properties": {
    "post_id": {
      "type": "string"
    }
  },
  "required": ["post_id"],
  "additionalProperties": false
}
```