var mqtt = require('mqtt');
var express = require('express');
const axios = require('axios');
const cors = require('cors');

const MQTT_SERVER = "192.168.1.14";
const MQTT_PORT = "1883";
const MQTT_USER = "";
const MQTT_PASSWORD = "";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

var client = mqtt.connect({
    host: MQTT_SERVER,
    port: MQTT_PORT,
    username: MQTT_USER,
    password: MQTT_PASSWORD
});

client.on('connect', function () {
    console.log("MQTT Connect");
    client.subscribe('dht11', function (err) {
        if (err) {
            console.log(err);
        }
    });
});

client.on('message', function (topic, message) {
    console.log('Received message:', message.toString());
    const sensorData = JSON.parse(message.toString());

    axios.post("http://192.168.1.14:4000/data", sensorData)
        .then(response => {
            console.log('Data sent successfully to the server:', response.data);
        })
        .catch(error => {
            console.error('Error sending data to the server:', error.message);
        });
});

app.get('/click/:status', (req, res) => {
    const data = req.params.status

    client.publish("LED", data.toString());
    res.json({ message: 'Command received successfully.' });
})

app.listen(port, () => {
    console.log(`Server listening on  https://localhost:${port}`);
});