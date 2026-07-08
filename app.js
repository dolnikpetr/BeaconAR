if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch(console.error);
}

const API =
    "https://script.google.com/macros/s/AKfycbz3I2onzrPLR7Bcfb-6cbeRtA74hf6utX0YGkIpCV_VKGR4jOPhBhdzzcKatojh6PvZWA/exec";

const camera =
    document.getElementById("camera");

const status =
    document.getElementById("status");

init();

async function init() {

    status.textContent = "Načítám scénáře...";

    await loadScenarios();

}

async function loadScenarios() {

    try {

        const response =
            await fetch(`${API}?action=list`);

        console.log("Response:", response);

        const data =
            await response.json();

        console.log("Data:", data);

        status.textContent =
            "Scénáře načteny.";

    }
    catch (error) {

        console.error(error);

        status.textContent =
            error.message;

    }

}
