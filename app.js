if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch(console.error);
}

const API =
    "https://script.google.com/macros/s/AKfycbz3I2onzrPLR7Bcfb-6cbeRtA74hf6utX0YGkIpCV_VKGR4jOPhBhdzzcKatojh6PvZWA/exec";

const camera =
    document.getElementById("camera")

const status =
    document.getElementById("status")

init()

async function init() {

    status.textContent =
        "Žádám o přístup ke kameře..."

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {

                        ideal: "environment"

                    }

                },

                audio: false

            })

        camera.srcObject = stream

        await camera.play()

        status.textContent =
            "✅ Kamera běží"

    }

    catch (error) {

        console.error(error)

        status.textContent =
            error.name + ": " + error.message

    }

}
