import { ref, onMounted, computed } from 'vue'
import ReconnectingWebSocket from "reconnecting-websocket";

// Handle a websocket that connects to a node-red dashboard url specified in the url query e.g "?url=localhost:1880"

// Data type
type Data = {
    theta: number,              // Elevation in degrees
    phi: number,                // Azimuth in degrees
    psi: number,                // Yaw in degrees
    time: number,               // Epoch in ms
    mode: number                // 1 = deploy, 2 = manual, 3 = bird, 4 = zenith, 5 = static, 6 = dynamic
    boat_heading: number,       // 0° = North
    wind_heading: number        // 0° = North
    total_traction: number      // kg
    battery_voltage: number     // V
    traction_time: [number, number][]
}

const data = ref<Data>({
    phi: 0,
    theta: 0,
    psi: 0,
    time: 0,
    mode: 0,
    boat_heading: 0,
    wind_heading: 0,
    total_traction: 0,
    battery_voltage: 0,
    traction_time: []
})

// Error message, tied to the socket status boolean
const socketStatus = ref("En attente de connection");
const socketConnected = ref(false);

export function useSocket() {
    onMounted(() => {
        // Get node-red url
        const route = useRoute();
        if (!route.query.url) socketStatus.value = "URL node-red manquante";

        // Trying to connect to the node-red dashboard
        const rws = new ReconnectingWebSocket(`ws://${route.query.url}/ws/dashboard`);

        rws.addEventListener("open", () => {
            socketStatus.value = "Connecté à node-red"
            socketConnected.value = true;
        });

        rws.addEventListener("close", () => {
            socketStatus.value = "Connection perdue"
            socketConnected.value = false;
        });

        rws.addEventListener("message", (event) => {
            const dataRaw = JSON.parse(event.data)
            data.value = { ...data.value, ...dataRaw }
            data.value.traction_time.push([data.value.time + 2 * 3600000, data.value.total_traction])
            if (data.value.traction_time.length > 100) data.value.traction_time.shift()
        })
    })
    return { data, socketStatus, socketConnected }
}

