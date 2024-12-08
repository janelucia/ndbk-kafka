import * as avro from 'avsc';
import {RawAvroSchema} from "@kafkajs/confluent-schema-registry/dist/@types";

// Avro-Schema
export const likesSchema: RawAvroSchema = {
    "type": "record",
    "name": "Like",
    "namespace": "test",
    "fields": [
        {
            "name": "post_id",
            "type": "string"
        }
    ]
}

export const avroType = avro.Type.forSchema(likesSchema);