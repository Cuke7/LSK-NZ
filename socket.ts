import { ref, onMounted, onUnmounted } from 'vue'
import ReconnectingWebSocket from "reconnecting-websocket";

// Handle a websocket that connects to a node-red dashboard url specified in the url query e.g "?url=localhost:1880"

// Data type
interface dataFromNodeRed {
    theta: number,  // Elevation in degrees
    phi: number,    // Azimuth in degrees
    psi: number,    // Yaw in degrees
    time: number,
    mode: number
    boat_heading: number, // 0° => North
    wind_heading: number
}

// Reactive data, to be used in all the app
const data = ref<dataFromNodeRed>({
    phi: 0,
    theta: 0,
    psi: 0,
    time: 0,
    mode: 0,
    boat_heading: 0,
    wind_heading: 0
})

// Error message, tied to the socket status boolean
const socketStatus = ref("Waiting for connection");
const socketConnected = ref(false);

export function useSocket() {
    onMounted(() => {
        // Get node-red url
        const route = useRoute();
        if (!route.query.url) socketStatus.value = "Missing node-red url";

        // Trying to connect to the node-red dashboard
        const rws = new ReconnectingWebSocket(`ws://${route.query.url}/ws/dashboard`);

        rws.addEventListener("open", () => {
            socketStatus.value = "Connected to node-red"
            socketConnected.value = true;
        });

        rws.addEventListener("close", () => {
            socketStatus.value = "Connection lost"
            socketConnected.value = false;
        });

        rws.addEventListener("message", (event) => {
            data.value = JSON.parse(event.data)
        })
    })
    return { data, socketStatus, socketConnected }
}

