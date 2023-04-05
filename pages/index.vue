<template>
    <div class="flex h-full flex-col overflow-hidden">
        <img src="../assets/images/image_beyond.jpg" alt="" class="w-32 absolute left-2 top-2 rounded-md" />
        <div class="flex w-full">
            <!-- p5 SKETCH -->
            <div id="container" class="w-7/12 flex items-center justify-center aspect-[2/1]" ref="sketch"></div>
            <!-- Status -->
            <div class="flex flex-col flex-grow">
                <div class="ml-4">{{ getDate }}</div>
                <div class="flex gap-4 items-center ml-4">
                    <span>{{ socketStatus }}</span>
                    <span class="bg-green-400 h-4 w-4 rounded-full" v-if="socketConnected" />
                    <div class="bg-red-400 h-4 w-4 rounded-full" v-else />
                </div>
                <div class="flex-grow flex">
                    <div class="flex flex-col items-center pt-4">
                        <div class="flex grow">
                            <img src="../assets/images/power_arrow.svg" class="h-full" />
                        </div>
                        <span class="font-mono">Power</span>
                    </div>
                    <div class="flex flex-col grow justify-evenly">
                        <div class="text-green-300 rounded justify-center p-2 flex font-bold">fold/deploy</div>
                        <div class="text-green-400 rounded justify-center p-2 flex font-bold">manuel</div>
                        <div class="text-green-500 rounded justify-center p-2 flex font-bold">bird</div>
                        <div class="text-green-600 rounded justify-center p-2 flex font-bold border-4 border-primary">zenith</div>
                        <div class="text-green-700 rounded justify-center p-2 flex font-bold">statique</div>
                        <div class="text-green-800 rounded justify-center p-2 flex font-bold">dynamique</div>
                    </div>
                    <div class="flex flex-col gap-8 justify-center px-8 grow">
                        <div class="bg-slate-400 flex justify-center items-center rounded py-2 cursor-pointer px-2">Settings</div>
                        <div class="bg-slate-400 flex justify-center items-center rounded py-2 cursor-pointer px-2">Maintenance</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-1 py-4 justify-evenly">
            <div class="flex flex-col items-center">
                <div>
                    Traction des lignes : <span class="font-bold">{{ data.total_traction }} kg</span>
                </div>
                <apexchart type="bar" height="90%" width="40%" :options="barOptions" :series="barTractionSerie" />
            </div>
            <div class="flex flex-col justify-between">
                <div>
                    Azimuth : <span class="font-bold">{{ data.phi }} °</span>
                </div>
                <div>
                    Élévation : <span class="font-bold">{{ data.theta }} °</span>
                </div>
                <div>
                    Lacet : <span class="font-bold">{{ data.psi }} °</span>
                </div>
                <span>Mode : <span class="font-bold">zenith</span></span>
                <span>Batterie : <span class="font-bold">12.6 V</span></span>
                <span>System healthy</span>
                <div class="bg-red-600 rounded p-2 flex justify-center text-white cursor-pointer">Stop power</div>
            </div>
            <div class="flex flex-col items-center">
                <div>Traction des lignes</div>
                <div class="flex grow">
                    <apexchart type="line" height="100%" :options="lineOptions" :series="tractionLine" />
                </div>
            </div>
            <div class="flex flex-col justify-between">
                <div class="text-7xl">104°</div>
                <div class="text-7xl">91°</div>
                <div class="text-7xl">246°</div>
            </div>
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
            p.fill("#4b6bfb");
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

const tractionLine = computed<ApexOptions["series"]>(() => {
    return [
        {
            // data: [
            //     [0, 0],
            //     [1, 3],
            // ],
            data: data.value.traction_time,
        },
    ];
});

const barTractionSerie = computed<ApexOptions["series"]>(() => {
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

const lineOptions: ApexOptions = {
    legend: {
        fontSize: "16px",
        labels: {
            useSeriesColors: true,
        },
        itemMargin: {
            horizontal: 20,
            vertical: 10,
        },
    },
    markers: {
        size: 0,
        colors: "#FFFFFF",
    },
    stroke: {
        width: 2,
        curve: "smooth",
    },
    tooltip: {
        enabled: false,
    },
    grid: {
        yaxis: {
            lines: {
                show: false,
            },
        },
    },
    chart: {
        animations: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    dataLabels: {
        enabled: false,
    },
    xaxis: {
        type: "datetime",
        axisBorder: {
            show: true,
            color: "black",
        },
        axisTicks: {
            show: true,
            color: "black",
        },
        labels: {
            style: {
                colors: "black",
                fontSize: "12px",
            },
        },
    },
    yaxis: {
        axisBorder: {
            show: true,
            color: "black",
            offsetX: 0,
            offsetY: 0,
        },
        axisTicks: {
            show: true,
            color: "black",
            width: 6,
            offsetX: 0,
            offsetY: 0,
        },
        labels: {
            style: {
                colors: "black",
                fontSize: "12px",
            },
        },
    },
};

// Charts
const barOptions: ApexOptions = {
    fill: {
        colors: ["#4b6bfb"],
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
            },
        },
    },
    yaxis: {
        max: 2000,
        labels: {
            style: {
                colors: "black",
                fontSize: "12px",
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

const linedata = computed(() => {});
</script>
