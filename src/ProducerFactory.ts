import { Kafka, Producer } from 'kafkajs'


export default class ProducerFactory {
    private producer: Producer

    constructor() {
        this.producer = this.createProducer()
    }

    public async start(): Promise<void> {
        try {
            await this.producer.connect()
        } catch (error) {
            console.log('Error connecting the producer: ', error)
        }
    }

    public async shutdown(): Promise<void> {
        await this.producer.disconnect()
    }

    public async send(topic: string, message: string) {
        this.producer.send({
            topic,
            messages: [
                {value: message},
            ],
        }).catch(e => console.error(e))
    }

    private createProducer() : Producer {
        const kafka = new Kafka({
            // logLevel: logLevel.DEBUG,
            clientId: "Our Bluesky Stream Listener",
            brokers: [`${process.env.BROKER_HOST}:${process.env.BROKER_PORT}`]
        })

        return kafka.producer()
    }
}