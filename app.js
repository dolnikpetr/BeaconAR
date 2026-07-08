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

            alert(scenario.id);

        });

        scenarioList.appendChild(button);

    });

}
