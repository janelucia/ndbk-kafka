import {WebSocket} from 'ws';
import ProducerFactory from "./ProducerFactory";

const producer = new ProducerFactory()

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

async function main() {

    await producer.start()

    const connection = new WebSocket('wss://jetstream1.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post');

    connection.on('message', async function incoming(data: any) {
        try {

            const postObject = JSON.parse(data.toString())

            // console.debug(JSON.stringify(postObject, null, 2))

            const postKind = postObject['kind']

            if (postKind === "commit") {

                const likeOperation = postObject['commit']['operation']

                if (likeOperation === "create") {

                    const postRecord = postObject['commit']['record']
                    const postRecordKey = postObject['commit']['rkey']

                    const postText = postRecord['text']
                    let lang = '?'

                    if (postRecord['langs'] !== undefined) {
                        lang = postRecord['langs'][0]
                    }

                    const postRecordJson = {
                        did: postObject['did'],
                        rkey: postRecordKey,
                        text: postText,
                        lang: lang.substring(0, 2),
                    }

                    producer.sendJson('posts', postRecordJson).then(() => {
                        console.log(`post: ${postRecordKey}`)
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
