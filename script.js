// Configuration
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1326963981360824463/861jjRE5aP_AsvQu5i1mWxhmhATwIOsrDJ6ywzq9GLLq3aQB17lj5GEOejtK3KiLB5jY'; // Replace with your webhook URL
const TARGET_LOCATION = {
    lat: 12.906363,  // Replace with your target latitude
    lng: 77.573257, // Replace with your target longitude
    radius: 100 // Distance in meters
};

const CHECKPOINTS = [
    {
        name: "Home",
        lat: 12.9130004,  // Replace with actual latitude
        lng: 77.5514108,  // Replace with actual longitude
        radius: 50,  // 50 meters radius
        passed: false  // To track if checkpoint has been passed
    },
    
];

let watchId = null;

function startTracking() {
    if ("geolocation" in navigator) {
        document.getElementById('status').textContent = 'Tracking Started...';
        
        watchId = navigator.geolocation.watchPosition(
            checkCheckpoints,
            (error) => console.error('Error:', error),
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        document.getElementById('status').textContent = 'Tracking Stopped';
        // Reset all checkpoints
        CHECKPOINTS.forEach(checkpoint => checkpoint.passed = false);
    }
}

function checkCheckpoints(position) {
    const currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    CHECKPOINTS.forEach(checkpoint => {
        if (!checkpoint.passed) {  // Only check if checkpoint hasn't been passed
            const distance = calculateDistance(currentLocation, checkpoint);
            
            if (distance <= checkpoint.radius) {
                checkpoint.passed = true;
                sendDiscordMessage(checkpoint.name);
            }
        }
    });
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

async function sendDiscordMessage(checkpointName) {
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: `✅ ${checkpointName} reached!`,
                username: 'Checkpoint Tracker'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send Discord message');
        }
    } catch (error) {
        console.error('Error sending to Discord:', error);
    }
}