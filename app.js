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

    try {

        const response = await fetch(

            `${API}?action=scenario&id=${encodeURIComponent(id)}&_=${Date.now()}`,

            {
                cache: "no-store"
            }

        );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(data.error);

        }

        currentScenario = data.scenario;

        console.log(currentScenario);

        // Další krok:
        // startCamera();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}
