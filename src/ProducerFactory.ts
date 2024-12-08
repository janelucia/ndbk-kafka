import { Producer } from 'kafkajs'
import {kafka} from "./kafka";


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

    public async sendJson(topic: string, message: any): Promise<void> {
        this.producer.send({
            topic,
            messages: [
                {value: JSON.stringify(message)},
            ],
        }).catch(e => console.error(e))
    }

    public async sendAvro(topic: string, message: Buffer): Promise<void> {
        this.producer.send({
            topic,
            messages: [
                {value: message},
            ],
        }).catch(e => console.error(e))
    }

    private createProducer() : Producer {
        return kafka.producer()
    }
}