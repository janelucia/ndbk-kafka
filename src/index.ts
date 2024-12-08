import {Kafka} from "kafkajs";
import { WebSocket } from 'ws';
import { EventEmitter } from 'events';

// Define the type for RepoCommit events
interface RepoCommitEvent {
    repo: string;
    ops: { action: string; path: string }[];
}

// Event emitter for handling repo stream events
class RepoStreamCallbacks extends EventEmitter {
    constructor() {
        super();
    }

    handleRepoCommit(evt: RepoCommitEvent) {
        console.log("Event from", evt.repo);
        evt.ops.forEach(op => {
            console.log(` - ${op.action} record ${op.path}`);
        });
    }
}


const kafka = new Kafka({
    clientId: "Our Bluesky Stream Listener",
    brokers: [`${process.env.BROKER_HOST}:${process.env.BROKER_PORT}`]
})

// Now to produce a message to a topic, we'll create a producer using our client:
const producer = kafka.producer()

// Send messages to kafka
async function sendToKafka(topic: string, message: string) {
    await producer.connect()
    await producer.send({
        topic,
        messages: [
            {value: message},
        ],
    })
    await producer.disconnect()
}

// get data and send to kafka

async function main() {
    // Create a new RepoStreamCallbacks instance
    const rsc = new RepoStreamCallbacks();

    const connection = new WebSocket('wss://jetstream1.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.like');

    connection.on('message', async function incoming(data: any) {
        try {
            // Sie könnten hier eine Verarbeitung oder eine Validierung der Daten vornehmen
            console.log(JSON.parse(data.toString()));

            // await producer.send({
            //     topic: 'likes',
            //     messages: [
            //         { value: data.toString() }, // Senden als String; für JSON müssen Sie möglicherweise JSON.stringify(data) verwenden
            //     ],
            // });

            console.log('Nachricht erfolgreich an Kafka gesendet');
        } catch (err) {
            console.error('Fehler beim Senden der Nachricht an Kafka', err);
        }
    });

    // Handle WebSocket errors
    connection.on('error', (error) => {
        console.error("WebSocket error:", error);
    });
}

main().catch(e => console.error(e))