import { Kafka } from "kafkajs";
import env from "../env";
import { Service } from "typedi";

@Service()
export class KafkaClient {
  private kafka: Kafka;
  private producer: any;
  private consumer: any;

  constructor() {
    this.kafka = new Kafka({
      clientId: env.kafka.KAFKA_CLIENT_ID,
      brokers: [env.kafka.KAFKA_BROKER],
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "sensor-group" });
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

  public async connectConsumer() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: env.kafka.VEHICLE_SENSOR_TOPIC,
      fromBeginning: false,
    });
  }

  public async consumeMessages(
    eachMessageHandler: (message: any) => Promise<void>
  ) {
    await this.consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: {
        topic: string;
        partition: string;
        message: any;
      }) => {
        await eachMessageHandler(message);
      },
    });
  }
}
