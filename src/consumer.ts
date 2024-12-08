import {kafka} from "./kafka";
import {Consumer} from "kafkajs";


const consumer = kafka.consumer({groupId: 'bun consumer'})


const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']


async function main() {
    await consumer.subscribe({ topic: 'likes', fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {

            // AVRO
            // const like: any = avroType.fromBuffer(message.value);
            // console.log(like.post_id);

            // JSON
            // @ts-ignore
            const like = JSON.parse(message.value);
            console.log(like.post_id);

        },
    })

    consumer.on('consumer.connect', async () => {
        console.log('Consumer connected')
    });
}

async function likes_aggregated() {
    await consumer.subscribe({ topic: 'LIKES_AGGREGATED', fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {


            const like_key = Buffer.from(message.key).toString().substring(0, 13);
            const like_value = Buffer.from(message.value).toString();

            console.log(like_key);
            console.log(like_value);
            // console.log(message);

        },
    })

    consumer.on('consumer.connect', async () => {
        console.log('Consumer connected')
    });
}

// main().catch(e => console.error(e))
likes_aggregated().catch(e => console.error(e))



signalTraps.forEach(type => {
    process.once(type, async () => {
        try {
            console.log(`Shutting down consumer...`)
            await consumer.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})
