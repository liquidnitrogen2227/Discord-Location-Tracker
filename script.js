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
        lat: 12.911181,   // Replace with actual latitude
        lng: 77.551658,  // Replace with actual longitude
        radius: 100,  // 50 meters radius
        passed: false  // To track if checkpoint has been passed
    },
    {
        name: "Sarakki",
        lat: 12.906528, 
        lng: 77.574605,
        radius: 100,
        passed: false
    },
    {
        name: "McD",
        lat: 12.907123,
        lng: 77.585674,
        radius: 100,
        passed: false
    },
    {
        name: "TTD",
        lat: 12.910535, 
        lng: 77.588113,
        radius: 100,
        passed: false
    },
    {
        name: "MG",
        lat: 12.910332,
        lng:  77.594900,
        radius: 100,
        passed: false
    },
    {
        name: "MINI-FOREST",
        lat: 12.910627,
        lng:  77.598852,
        radius: 100,
        passed: false
    },
    {
        name: "VEGA SIGNAL",
        lat: 12.907040, 
        lng: 77.599499,
        radius: 100,
        passed: false
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