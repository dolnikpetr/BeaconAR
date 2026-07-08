if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

const API =
    "https://script.google.com/macros/s/AKfycbz3I2onzrPLR7Bcfb-6cbeRtA74hf6utX0YGkIpCV_VKGR4jOPhBhdzzcKatojh6PvZWA/exec";

let screenSelect;
let scenarioList;

document.addEventListener("DOMContentLoaded", init);

async function init() {

    screenSelect = document.getElementById("screenSelect");
    scenarioList = document.getElementById("scenarioList");

    if (!screenSelect) {
        throw new Error("Element #screenSelect nebyl nalezen.");
    }

    if (!scenarioList) {
        throw new Error("Element #scenarioList nebyl nalezen.");
    }

    await loadScenarios();

}

async function loadScenarios() {

    const response = await fetch(`${API}?action=list`, {
        cache: "no-store"
    });

    const data = await response.json();

    showScenarioSelector(data.scenarios);

}

function showScenarioSelector(scenarios) {

    screenSelect.classList.remove("hidden");

    scenarioList.innerHTML = "";

    scenarios.forEach(scenario => {

        const button = document.createElement("button");

        button.textContent = scenario.name;

        button.addEventListener("click", () => {
            alert(scenario.id);
        });

        scenarioList.appendChild(button);

    });

}
