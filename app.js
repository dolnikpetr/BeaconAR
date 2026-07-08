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

    try {

        const response = await fetch(`${API}?action=list`, {

            cache: "no-store"

        });

        const data = await response.json();

        console.log("API:", data);

        showScenarioSelector(data.scenarios);

    }
    catch (error) {

        console.error(error);

        alert(error);

    }

}
function showScenarioSelector(scenarios) {

    console.log("showScenarioSelector()", scenarios);

    console.log(screenLoading);
    console.log(screenSelect);
    console.log(scenarioList);

    screenLoading.classList.add("hidden");

    screenSelect.classList.remove("hidden");

        
    scenarioList.innerHTML = "";

    scenarios.forEach(scenario => {

        const button = document.createElement("button");

        button.textContent = scenario.name;

        button.onclick = () => {

            alert(scenario.id);

        };

        scenarioList.appendChild(button);

    });

}
