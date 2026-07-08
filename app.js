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

const VERSION = "4";

const CAMERA_FOV = 70;

const API =
    "https://script.google.com/macros/s/AKfycbz3I2onzrPLR7Bcfb-6cbeRtA74hf6utX0YGkIpCV_VKGR4jOPhBhdzzcKatojh6PvZWA/exec";

const ICONS = {

    pin: "📍",
    camp: "🏕️",
    crate: "📦",
    antenna: "📡",

    star: "⭐",
    person: "👤",
    house: "🏠",
    door: "🚪"

};

const COLORS = {

    white: "#ffffff",
    blue: "#2563eb",
    green: "#16a34a",
    yellow: "#eab308",
    orange: "#ea580c",
    red: "#dc2626",
    purple: "#9333ea"

};


// =====================================================
// DOM
// =====================================================

const pointContainer =
    document.getElementById("pointContainer");

const screenSelect =
    document.getElementById("screenSelect");

const screenAR =
    document.getElementById("screenAR");

const scenarioList =
    document.getElementById("scenarioList");

const camera =
    document.getElementById("camera");

const debugGps =
    document.getElementById("debugGps");

const debugHeading =
    document.getElementById("debugHeading");

const debugPoints =
    document.getElementById("debugPoints");

const debugAlpha =
    document.getElementById("debugAlpha");

const debugAbsolute =
    document.getElementById("debugAbsolute");

const debugBeta =
    document.getElementById("debugBeta");

const debugGamma =
    document.getElementById("debugGamma");

// =====================================================
// STATE
// =====================================================

let currentScenario = null;

let currentLocation = null;

let currentHeading = null;



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

        const data = await response.json();

        if (!data.success) {

            throw new Error("Nepodařilo se načíst scénáře.");

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

        button.addEventListener(

            "click",

            () => loadScenario(scenario.id)

        );

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

    initializeRenderer();

    startGPS();

    await startCompass();

}


function initializeRenderer() {

    if (!currentScenario) {
        return;
    }

    pointContainer.innerHTML = "";

    currentScenario.points.forEach(point => {

        const element = document.createElement("div");

        element.className = "point";

        const icon =
            ICONS[point.icon] || "📍";

        element.textContent =
            `${icon} ${point.name}`;

        element.style.position = "absolute";

        element.style.display = "block";

        element.style.color =
            COLORS[point.color] || "#ffffff";

        point.element = element;

        pointContainer.appendChild(element);

    });

    render();

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

        console.error("GPS není podporována.");

        return;

    }

    navigator.geolocation.watchPosition(

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

function onPosition(position) {

    currentLocation = {

        latitude: position.coords.latitude,

        longitude: position.coords.longitude,

        accuracy: position.coords.accuracy,

        heading: position.coords.heading,

        speed: position.coords.speed

    };

    updateScenario();

    updateHUD();

}

// =====================================================

function onPositionError(error) {

    console.error(error);

}

// =====================================================
// COMPASS
// =====================================================

async function startCompass() {

    if (typeof DeviceOrientationEvent === "undefined") {

        console.warn("Kompas není podporován.");

        return;

    }

    const eventName =

        "ondeviceorientationabsolute" in window

            ? "deviceorientationabsolute"

            : "deviceorientation";

    window.addEventListener(

        eventName,

        onOrientation,

        true

    );

}

// =====================================================

function onOrientation(event) {

    if (event.alpha == null) {
        return;
    }

    // Převod alpha -> klasický heading
    currentHeading = (360 - event.alpha) % 360;

    debugHeading.textContent =
        "Heading: " +
        Math.round(currentHeading) +
        "°";

    debugAlpha.textContent =
        "Alpha: " +
        Math.round(event.alpha);

    debugBeta.textContent =
        "Beta: " +
        Math.round(event.beta);

    debugGamma.textContent =
        "Gamma: " +
        Math.round(event.gamma);

    debugAbsolute.textContent =
        "Absolute: " +
        event.absolute;

    updateScenario();

    updateHUD();

}

// =====================================================
// HUD
// =====================================================

function updateHUD() {

    if (currentLocation) {

        debugGps.textContent =
            "GPS: ±" +
            Math.round(currentLocation.accuracy) +
            " m";

    }

    if (currentHeading != null) {

        debugHeading.textContent =
            "Heading: " +
            Math.round(currentHeading) +
            "°";

    }

    if (currentScenario) {

        debugPoints.textContent =
            "Points: " +
            currentScenario.points.length;

    }

}

// =====================================================
// SCENARIO UPDATE
// =====================================================

function updateScenario() {

    if (!currentScenario) {
        return;
    }

    if (!currentLocation) {
        return;
    }

    currentScenario.points.forEach(updatePoint);

    render();

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

    if (currentHeading == null) {

        point.relativeAngle = 0;
        point.visible = true;

    }
    else {

        point.relativeAngle =
            normalizeAngle(
                point.bearing - currentHeading
            );

        const halfFov =
            CAMERA_FOV / 2;

        point.visible =
            Math.abs(point.relativeAngle) <= halfFov;

    }

    const halfFov =
        CAMERA_FOV / 2;

    point.screenX =

        (

            point.relativeAngle + halfFov

        )

        /

        CAMERA_FOV

        *

        window.innerWidth;

    point.screenY =
        window.innerHeight / 2;

}

function render() {

    if (!currentScenario) {
        return;
    }

    currentScenario.points.forEach(point => {

        if (!point.element) {
            return;
        }

        const x =
            Number.isFinite(point.screenX)
                ? point.screenX
                : window.innerWidth / 2;

        const y =
            Number.isFinite(point.screenY)
                ? point.screenY
                : window.innerHeight / 2;

        point.element.style.display = "block";

        point.element.style.left = `${x}px`;

        point.element.style.top = `${y}px`;

    });

}
// =====================================================

function normalizeAngle(angle) {

    while (angle > 180) {

        angle -= 360;

    }

    while (angle < -180) {

        angle += 360;

    }

    return angle;

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

    const φ1 =
        lat1 * Math.PI / 180;

    const φ2 =
        lat2 * Math.PI / 180;

    const λ1 =
        lon1 * Math.PI / 180;

    const λ2 =
        lon2 * Math.PI / 180;

    const y =

        Math.sin(

            λ2 - λ1

        ) *

        Math.cos(φ2);

    const x =

        Math.cos(φ1) *

        Math.sin(φ2)

        -

        Math.sin(φ1) *

        Math.cos(φ2) *

        Math.cos(

            λ2 - λ1

        );

    let bearing =

        Math.atan2(

            y,

            x

        ) *

        180 /

        Math.PI;

    bearing =

        (

            bearing + 360

        ) %

        360;

    return bearing;

}
