<template>
    <div class="flex h-full flex-1 flex-col">
        <img src="../assets/images/image_beyond.jpg" alt="" class="w-32 absolute left-2 top-2 rounded-md" />
        <div class="flex w-full">
            <!-- p5 SKETCH -->
            <div id="container" class="w-2/3 flex items-center justify-center aspect-[2/1]" ref="sketch"></div>
            <div class="bg-slate-400 flex items-center flex-1 justify-center font-mono">Modes</div>
        </div>
        <div class="flex flex-1 bg-red-400 justify-center items-center font-mono">Mesures</div>
    </div>
</template>

<script lang="ts" setup>
import { listen } from "listhen";
import p5 from "p5";
import { ref, onMounted } from "vue";

// p5 sketch
const sketch = ref<HTMLDivElement | null>(null);
// dynamic canva size
const size = computed(() => {
    if (!sketch.value) return { width: 50, height: 50 };
    return { width: sketch.value.clientWidth, height: sketch.value.clientHeight };
});

const boat_heading = 170;
const wind_heading = 130;
const kitePos = {
    theta: 60,
    phi: 60,
    psi: 0,
};

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
            p.translate(p.sin(p.radians(kitePos.phi)) * p.cos(p.radians(kitePos.theta)) * r, -p.sin(p.radians(kitePos.theta)) * r);
            p.rotate(p.radians(kitePos.psi));
            p.arc(0, 10, 50, 50, p.PI, 0);
            p.pop();
        };

        const draw_boat = (p: p5) => {
            p.push();
            p.rotate(-p.HALF_PI + p.radians(wind_heading - boat_heading));
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
            p.text(`${boat_heading}°`, p.cos(-p.HALF_PI + p.radians(wind_heading - boat_heading)) * r * 1.05, p.sin(-p.HALF_PI + p.radians(wind_heading - boat_heading)) * r * 1.05);
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
</script>
