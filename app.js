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

const VERSION = "3";

const API =
    "https://script.google.com/macros/s/AKfycbz3I2onzrPLR7Bcfb-6cbeRtA74hf6utX0YGkIpCV_VKGR4jOPhBhdzzcKatojh6PvZWA/exec";

// =====================================================
// DOM
// =====================================================

const screenSelect =
    document.getElementById("screenSelect");

const screenAR =
    document.getElementById("screenAR");

const scenarioList =
    document.getElementById("scenarioList");

const camera =
    document.getElementById("camera");

// =====================================================
// STATE
// =====================================================

let currentScenario = null;

let currentLocation = null;

let gpsWatchId = null;

let arTimer = null;

// =====================================================

window.addEventListener("load", init);

// =====================================================
// INIT
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
// UI
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
// SCENARIO
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

        await enterAR();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// =====================================================
// AR
// =====================================================

async function enterAR() {

    screenSelect.hidden = true;

    screenAR.hidden = false;

    try {

        await startCamera();

    }

    catch (error) {

        console.error(error);

    }

    startGPS();

    startAREngine();

}


// =====================================================
// CAMERA
// =====================================================

async function startCamera() {

    if (!navigator.mediaDevices?.getUserMedia) {

        throw new Error("Prohlížeč nepodporuje kameru.");

    }

    let stream;

    try {

        stream = await navigator.mediaDevices.getUserMedia({

            video: {

                facingMode: {
                    ideal: "environment"
                }

            },

            audio: false

        });

    }

    catch {

        stream = await navigator.mediaDevices.getUserMedia({

            video: true,

            audio: false

        });

    }

    camera.srcObject = stream;

    await camera.play();

}

// =====================================================
// GPS
// =====================================================

function startGPS() {

    if (!navigator.geolocation) {

        console.warn("GPS není podporována.");

        return;

    }

    gpsWatchId = navigator.geolocation.watchPosition(

        onPosition,

        onPositionError,

        {

            enableHighAccuracy: true,

            maximumAge: 0,

            timeout: 10000

        }

    );

}

// =====================================================
// AR ENGINE
// =====================================================

function startAREngine() {

    if (arTimer) {

        clearInterval(arTimer);

    }

    arTimer = setInterval(

        updateAR,

        3000

    );

}

// =====================================================

// =====================================================

function updateAR() {

    if (!currentScenario) {

        return;

    }

    if (!currentLocation) {

        console.log("Waiting for GPS...");

        return;

    }

    updateScenario();

    console.clear();

    console.table(

        currentScenario.points.map(point => ({

            name: point.name,

            distance: Math.round(point.distance),

            bearing: Math.round(point.bearing)

        }))

    );

}



// =====================================================

function onPosition(position) {

    currentLocation = {

        latitude: position.coords.latitude,

        longitude: position.coords.longitude,

        accuracy: position.coords.accuracy,

        heading: position.coords.heading,

        speed: position.coords.speed

    };

    console.log(currentLocation);

}

// =====================================================

function onPositionError(error) {

    console.error(error);

}


// =====================================================

function updateScenario() {

    if (!currentScenario) {
        return;
    }

    if (!currentLocation) {
        return;
    }

    currentScenario.points.forEach(updatePoint);

}

// =====================================================

function updatePoint(point) {

    point.distance = calculateDistance(

        currentLocation.latitude,
        currentLocation.longitude,

        point.lat,
        point.lng

    );

    point.bearing = calculateBearing(

        currentLocation.latitude,
        currentLocation.longitude,

        point.lat,
        point.lng

    );

}

// =====================================================

function calculateDistance(

    lat1,
    lon1,

    lat2,
    lon2

) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;

    const a =

        Math.sin(dLat / 2) *
        Math.sin(dLat / 2)

        +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180)

        *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;

}


// =====================================================

function calculateBearing(

    lat1,
    lon1,

    lat2,
    lon2

) {

    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;

    const λ1 = lon1 * Math.PI / 180;
    const λ2 = lon2 * Math.PI / 180;

    const y =

        Math.sin(λ2 - λ1) *
        Math.cos(φ2);

    const x =

        Math.cos(φ1) *
        Math.sin(φ2)

        -

        Math.sin(φ1) *
        Math.cos(φ2) *
        Math.cos(λ2 - λ1);

    let bearing =

        Math.atan2(y, x) *
        180 / Math.PI;

    bearing =

        (bearing + 360) % 360;

    return bearing;

}
