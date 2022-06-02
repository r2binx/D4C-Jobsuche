const Kafka = require("node-rdkafka");

const topicName = "jobsuche";

async function produce(params) {
	let bx_creds = params["__bx_creds"];
	if (!bx_creds) throw new Error("Missing __bx_creds parameter.");

	let kafka_creds = bx_creds["messagehub"];
	if (!kafka_creds) throw new Error("Missing cloud-object-storage parameter.");
	console.log(kafka_creds);

	const producer = new Kafka.Producer({
		"metadata.broker.list": kafka_creds["kafka_brokers_sasl"].join(),
		"sasl.mechanisms": "PLAIN",
		"security.protocol": "SASL_SSL",
		"sasl.username": kafka_creds["user"],
		"sasl.password": kafka_creds["password"],
		dr_cb: true,
	});

	producer.on("ready", () => {
		console.log("Producer is ready");
		producer.produce(
			topicName,
			null,
			Buffer.from(JSON.stringify(params)),
			null,
			Date.now()
		);
	});
}
