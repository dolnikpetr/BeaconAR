if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("./sw.js")

}

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
