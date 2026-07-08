if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("./sw.js");

}

const API =
    "https://script.google.com/macros/s/AKfycbz3I2onzrPLR7Bcfb-6cbeRtA74hf6utX0YGkIpCV_VKGR4jOPhBhdzzcKatojh6PvZWA/exec";

const screenLoading =
    document.getElementById("screenLoading");

const screenSelect =
    document.getElementById("screenSelect");

const scenarioList =
    document.getElementById("scenarioList");

init();

async function init() {

    await loadScenarios();

}

async function loadScenarios() {

    const response =
        await fetch(`${API}?action=list`, {

            cache: "no-store"

        });

    const data =
        await response.json();

    showScenarioSelector(data.scenarios);

}

function showScenarioSelector(scenarios) {

    screenLoading.hidden = true;

    screenSelect.hidden = false;

    scenarioList.innerHTML = "";

    scenarios.forEach(scenario => {

        const button =
            document.createElement("button");

        button.textContent =
            scenario.name;

        button.onclick = () => {

            alert(
                "Vybraný scénář: " +
                scenario.id
            );

        };

        scenarioList.appendChild(button);

    });

}
