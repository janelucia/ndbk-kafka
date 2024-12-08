import {Kafka} from "kafkajs";

export const kafka = new Kafka({
    // logLevel: logLevel.DEBUG,
    clientId: "Our Bluesky Stream Listener",
    brokers: [`${process.env.BROKER_HOST}:${process.env.BROKER_PORT}`]
})


