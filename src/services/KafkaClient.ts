import { Kafka } from "kafkajs";
import env from "../env";
import { Inject, Service } from "typedi";

@Service()
export class KafkaClient {
  private kafka: Kafka;
  private producer: any;

  constructor() {
    this.kafka = new Kafka({
      clientId: env.KAFKA_CLIENT_ID,
      brokers: [env.KAFKA_BROKER],
    });
    this.producer = this.kafka.producer();
  }

  public async connectProducer() {
    await this.producer.connect();
  }

  public async disconnectProducer() {
    await this.producer.disconnect();
  }

  public async sendSensorData(topic: string, messages: any[]) {
    await this.producer.send({
      topic,
      messages,
    });
  }
}
