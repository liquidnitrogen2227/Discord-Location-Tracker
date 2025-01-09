// Configuration
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1326963981360824463/861jjRE5aP_AsvQu5i1mWxhmhATwIOsrDJ6ywzq9GLLq3aQB17lj5GEOejtK3KiLB5jY'; // Replace with your webhook URL
const TARGET_LOCATION = {
    lat: 12.906363,  // Replace with your target latitude
    lng: 77.573257, // Replace with your target longitude
    radius: 100 // Distance in meters
};

let watchId = null;
let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

async function sendDiscordMessage(message) {
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: message,
                username: 'Location Tracker'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Discord message sent successfully!');
    } catch (error) {
        console.error('Error sending Discord message:', error);
        document.getElementById('status').innerHTML = 
            `Error sending notification: ${error.message}`;
    }
}

function startTracking() {
    if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
            handlePosition,
            handleError,
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
        document.getElementById('status').innerHTML = 
            '🟢 Tracking active...';
        sendDiscordMessage('📍 Location tracking started!');
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        document.getElementById('status').innerHTML = 
            '🔴 Tracking stopped';
        sendDiscordMessage('⏹️ Location tracking stopped!');
    }
}

function handlePosition(position) {
    const currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    const distance = calculateDistance(
        currentLocation,
        TARGET_LOCATION
    );

    document.getElementById('distance').innerText = 
        `Distance to target: ${Math.round(distance)}m`;

    // Check if we're within the radius and if enough time has passed since last notification
    if (distance <= TARGET_LOCATION.radius && 
        Date.now() - lastNotificationTime >= NOTIFICATION_COOLDOWN) {
        sendDiscordMessage(`🎯 Target location reached!\nCurrent distance: ${Math.round(distance)}m`);
        lastNotificationTime = Date.now();
    }
}

function calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat-point1.lat) * Math.PI/180;
    const Δλ = (point2.lng-point1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function handleError(error) {
    console.error('Error getting location:', error);
    document.getElementById('status').innerHTML = 
        `⚠️ Error: ${error.message}`;
}

// Add this function to test Discord webhook
async function testDiscord() {
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: "🔔 Test message from Location Tracker!",
                username: "Location Tracker"
            })
        });
        
        if (response.ok) {
            alert("Test message sent successfully!");
        } else {
            alert("Failed to send test message");
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
}
// Add this function to check current coordinates
function checkCurrentLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        alert(`Current Location:\nLatitude: ${position.coords.latitude}\nLongitude: ${position.coords.longitude}`);
    });
}