import {WebSocket} from 'ws';
import ProducerFactory from "./ProducerFactory";

const producer = new ProducerFactory()

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

async function main() {

    await producer.start()

    const connection = new WebSocket('wss://jetstream1.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.like');

    connection.on('message', async function incoming(data: any) {
        try {

            const likeObject = JSON.parse(data.toString())

            // console.debug(JSON.stringify(likeObject, null, 2))

            const likeKind = likeObject['kind']

            if (likeKind === "commit") {

                const likeOperation = likeObject['commit']['operation']

                if (likeOperation === "create") {
                    // send only post ID
                    const likedPostUrlParts = likeObject['commit']['record']['subject']['uri'].split('/')
                    const likedPostId = likedPostUrlParts[likedPostUrlParts.length - 1]


                    producer.send('Likes', likedPostId).then(() => {
                        console.log(`Liked post: ${likedPostId}`)
                    })
                }
            }
        } catch (err) {
            console.error('Fehler beim Senden der Nachricht an Kafka', err);
            console.error(data.toString())
        }
    });

    // Handle WebSocket errors
    connection.on('error', (error) => {
        console.error("WebSocket error:", error);
    });
}

main().catch(e => console.error(e))

signalTraps.forEach(type => {
    process.once(type, async () => {
        try {
            await producer.shutdown()
        } finally {
            process.kill(process.pid, type)
        }
    })
})
