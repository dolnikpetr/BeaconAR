// =====================================================
// DEVELOPMENT
// =====================================================

// Během vývoje nechceme Service Worker.

// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.register("./sw.js");
// }

// =====================================================
// CONFIG
// =====================================================

const screenSelect =
    document.getElementById("screenSelect");

const screenAR =
    document.getElementById("screenAR");

const camera =
    document.getElementById("camera");

const VERSION = "1";

const API =
    "https://script.google.com/macros/s/AKfycbz3I2onzrPLR7Bcfb-6cbeRtA74hf6utX0YGkIpCV_VKGR4jOPhBhdzzcKatojh6PvZWA/exec";

// =====================================================
// STATE
// =====================================================

let currentScenario = null;

// =====================================================

const scenarioList =
    document.getElementById("scenarioList");

window.addEventListener("load", init);

// =====================================================

async function init() {

    try {

        const response = await fetch(

            `${API}?action=list&_=${Date.now()}`,

            {
                cache: "no-store"
            }

        );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error("Nepodařilo se načíst seznam scénářů.");

        }

        renderScenarioList(data.scenarios);

    }

    catch (error) {

        console.error(error);

        scenarioList.innerHTML =
            "<p>Nepodařilo se načíst scénáře.</p>";

    }

}

// =====================================================

async function enterAR() {

    screenSelect.hidden = true;
    screenAR.hidden = false;

    try {

        await startCamera();

    }

    catch (error) {

        console.error(error);

        // zatím jen zalogujeme
        // později zobrazíme hlášku

    }

}


// =====================================================

// =====================================================

async function startCamera() {

    console.log("Starting camera...");

    if (!navigator.mediaDevices?.getUserMedia) {

        throw new Error("Prohlížeč nepodporuje kameru.");

    }

    let stream;

    try {

        console.log("Trying back camera...");

        stream = await navigator.mediaDevices.getUserMedia({

            video: {

                facingMode: {
                    ideal: "environment"
                }

            },

            audio: false

        });

    }

    catch (error) {

        console.warn("Back camera failed, trying default camera...", error);

        stream = await navigator.mediaDevices.getUserMedia({

            video: true,

            audio: false

        });

    }

    camera.srcObject = stream;

    await camera.play();

    console.log("Camera started.");

}

function renderScenarioList(list) {

    scenarioList.innerHTML = "";

    list.forEach(scenario => {

        const button =
            document.createElement("button");

        button.textContent =
            scenario.name;

        button.addEventListener("click", () => {

            loadScenario(scenario.id);

        });

        scenarioList.appendChild(button);

    });

}

// =====================================================


async function loadScenario(id) {

    console.log("Loading scenario:", id);

    try {

        const response = await fetch(
            `${API}?action=scenario&id=${encodeURIComponent(id)}&_=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        console.log("Response:", response);

        const data = await response.json();

        console.log("Data:", data);

        if (!data.success) {
            throw new Error(data.error);
        }

        currentScenario = data.scenario;

        console.log("Current scenario:", currentScenario);

        await enterAR();

    }
    catch (error) {

        console.error(error);

    }

}

