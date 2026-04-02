const video = document.getElementById('webcam');
const aiStatus = document.getElementById('ai-status');
const stopLight = document.getElementById('stop-light');
const goLight = document.getElementById('go-light');
const instruction = document.getElementById('instruction');
const canvas = document.getElementById('proc-canvas');

// 1. Activate Camera Sensor
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        video.srcObject = stream;
        aiStatus.innerText = "> SENSOR ONLINE: MONITORING LANE";
    })
    .catch(err => {
        aiStatus.innerText = "> ERROR: CAMERA BLOCKED";
    });

// 2. AI Recognition Cycle
async function analyzeTraffic() {
    aiStatus.innerText = "> ANALYZING DENSITY...";
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
        const result = await Tesseract.recognize(canvas.toDataURL(), 'eng');
        // Clean text to find alphanumeric plate patterns
        const detected = result.data.text.replace(/[^A-Z0-9]/gi, "");
        
        aiStatus.innerText = `> DETECTED: ${detected || "NONE"}`;

        // If more than 3 characters detected, trigger the signal
        if (detected.length > 3) {
            changeToGreen();
        }
    } catch (e) {
        console.error(e);
    }
}

function changeToGreen() {
    if (goLight.classList.contains('active')) return;

    stopLight.classList.remove('active');
    goLight.classList.add('active');
    instruction.innerText = "GO";
    instruction.style.color = "#00ff88";

    // Set timer to return to Red after 6 seconds
    setTimeout(() => {
        goLight.classList.remove('active');
        stopLight.classList.add('active');
        instruction.innerText = "STOP";
        instruction.style.color = "#ff3b3b";
        aiStatus.innerText = "> LANE CLEAR: WAITING...";
    }, 6000);
}

// Automatically scan for vehicles every 5 seconds
setInterval(analyzeTraffic, 5000);
