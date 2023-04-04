<template>
    <div class="flex h-full flex-1 flex-col">
        <img src="../assets/images/image_beyond.jpg" alt="" class="w-32 absolute left-2 top-2 rounded-md" />
        <div class="flex w-full">
            <!-- p5 SKETCH -->
            <div id="container" class="w-8/12 flex items-center justify-center aspect-[2/1]" ref="sketch"></div>
            <!-- Status -->
            <div class="flex flex-col flex-grow">
                <div>{{ getDate }}</div>
                <div class="flex gap-4 items-center">
                    <span>{{ socketStatus }}</span>
                    <span class="bg-green-400 h-4 w-4 rounded-full" v-if="socketConnected" />
                    <div class="bg-red-400 h-4 w-4 rounded-full" v-else />
                </div>
                <div class="flex-grow flex">
                    <div class="flex flex-grow">
                        <div class="flex flex-col items-center pt-4">
                            <div class="flex grow">
                                <img src="../assets/images/power_arrow.svg" class="h-full" />
                            </div>
                            <span class="font-mono">Power</span>
                        </div>
                        <div class="flex flex-col w-full px-8 justify-evenly h-full">
                            <div class="bg-green-100 rounded-lg py-2 px-4 justify-center items-center flex font-bold">fold/deploy</div>
                            <div class="bg-green-200 rounded-lg py-2 px-4 justify-center items-center flex font-bold">manual</div>
                            <div class="bg-green-300 rounded-lg py-2 px-4 justify-center items-center flex font-bold">bird</div>
                            <div class="bg-green-500 rounded-lg py-2 px-4 border-4 border-black justify-center items-center flex font-bold">zenith</div>
                            <div class="bg-green-700 rounded-lg py-2 px-4 justify-center items-center flex font-bold text-white">static</div>
                            <div class="bg-green-950 rounded-lg py-2 px-4 justify-center items-center flex font-bold text-white">dynamic</div>
                        </div>
                        <div class="flex flex-col gap-8 justify-center px-8 w-full">
                            <div class="bg-slate-400 flex justify-center items-center rounded-lg py-2 cursor-pointer px-2">Settings</div>
                            <div class="bg-slate-400 flex justify-center items-center rounded-lg py-2 cursor-pointer px-2">Maintenance</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-1">
            <div class="w-1/4 flex py-4">
                <div class="flex flex-col items-center w-full">
                    <div class="mx-auto flex">Traction des lignes : {{ data.total_traction }} (kg)</div>
                    <apexchart type="bar" height="90%" width="50%" :options="options" :series="traction" />
                </div>
            </div>
            <div class="bg-blue-400 w-1/4">Chart</div>
            <div class="bg-slate-400 w-1/4">Chart</div>
            <div class="bg-yellow-400 w-1/4">Chart</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import p5 from "p5";
import { ref, onMounted, computed } from "vue";
import { useSocket } from "../socket";
import { ApexOptions } from "apexcharts";

const { data, socketStatus, socketConnected } = useSocket();

const getDate = computed(() => {
    const date = new Date(data.value.time);
    const day = ("00" + date.getDate()).slice(-2);
    const month = ("00" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const hours = ("00" + date.getHours()).slice(-2);
    const minutes = ("00" + date.getMinutes()).slice(-2);
    const seconds = ("00" + date.getSeconds()).slice(-2);

    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
});

// p5 sketch
const sketch = ref<HTMLDivElement | null>(null);

// dynamic canva size
const size = computed(() => {
    if (!sketch.value) return { width: 50, height: 50 };
    return { width: sketch.value.clientWidth, height: sketch.value.clientHeight };
});

// const boat_heading = 170;
// const wind_heading = 130;

onMounted(() => {
    var sketch = (p: p5) => {
        let r: number;
        p.setup = () => {
            let sketch = p.createCanvas(size.value.width, size.value.height);
            sketch.parent("container");
            p.rectMode(p.CENTER);
            p.frameRate(24);
            r = p.height - 50;
        };

        p.draw = () => {
            p.clear(0, 0, 0, 0);
            p.translate(p.width / 2, p.height);
            draw_flight_window(p);
            draw_boat(p);
            plot_kite(p);
        };

        const plot_kite = (p: p5) => {
            p.push();
            p.fill("blue");
            p.noStroke();
            p.translate(p.sin(p.radians(data.value.phi)) * p.cos(p.radians(data.value.theta)) * r, -p.sin(p.radians(data.value.theta)) * r);
            p.rotate(p.radians(data.value.psi));
            p.arc(0, 10, 50, 50, p.PI, 0);
            p.pop();
        };

        const draw_boat = (p: p5) => {
            p.push();
            p.rotate(-p.HALF_PI + p.radians(data.value.wind_heading - data.value.boat_heading));
            p.fill("black");
            p.rect(0, 0, 80, 30);
            p.stroke("green");
            p.strokeWeight(2);
            p.line(0, 0, r, 0);
            p.pop();
            p.fill("green");
            p.noStroke();
            p.textSize(18);
            p.textAlign(p.CENTER);
            p.text(`${data.value.boat_heading}°`, p.cos(-p.HALF_PI + p.radians(data.value.wind_heading - data.value.boat_heading)) * r * 1.05, p.sin(-p.HALF_PI + p.radians(data.value.wind_heading - data.value.boat_heading)) * r * 1.05);
        };

        const draw_flight_window = (p: p5) => {
            p.noStroke();
            p.fill("#b3cdcd");
            p.arc(0, 0, 2 * r, 2 * r, p.PI, p.TWO_PI);
            p.fill("#aad2e5");
            p.arc(0, 0, 2 * ((2 * r) / 3), 2 * ((2 * r) / 3), p.PI, p.TWO_PI);
            p.fill("#81a0b9");
            p.arc(0, 0, 2 * (r / 3), 2 * (r / 3), p.PI, p.TWO_PI);
            const angles = [-150, -135, -120, -90, -60, -45, -30];
            p.textSize(12);
            for (const angle of angles) {
                p.stroke("black");
                p.strokeWeight(0.5);
                p.line(0, 0, p.cos(p.radians(angle)) * r, p.sin(p.radians(angle)) * r);
                p.fill("black");
                p.noStroke();
                p.text(`${angle < -90 ? angle + 180 : Math.abs(angle)}°`, p.cos(p.radians(angle)) * r * 1.05, p.sin(p.radians(angle)) * r * 1.05);
            }
        };
    };

    new p5(sketch);
});

const traction = computed<ApexOptions["series"]>(() => {
    return [
        {
            data: [
                {
                    x: "Un capteur",
                    y: data.value.total_traction,
                },
            ],
        },
    ];
});

// Charts
const options: ApexOptions = {
    fill: {
        opacity: 0.9,
        type: "solid",
        gradient: {
            shade: "dark",
            type: "horizontal",
            shadeIntensity: 0.5,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 100],
            colorStops: [],
        },
    },
    tooltip: {
        enabled: false,
    },
    plotOptions: {
        bar: {
            columnWidth: "50",
        },
    },
    chart: {
        toolbar: {
            show: false,
        },
        sparkline: {
            enabled: false,
        },
    },
    dataLabels: {
        enabled: false,
    },
    xaxis: {
        labels: {
            show: false,
            style: {
                colors: "black",
                fontSize: "12px",
                fontFamily: "Roboto', sans-serif;",
            },
        },
    },
    yaxis: {
        max: 2000,
        labels: {
            style: {
                colors: "black",
                fontSize: "12px",
                fontWeight: 400,
                fontFamily: "Roboto', sans-serif;",
            },
        },
    },
    grid: {
        yaxis: {
            lines: {
                show: false,
            },
        },
    },
};
</script>
