const video = document.getElementById('vid');
const log = document.getElementById('log');
const redLight = document.getElementById('red');
const greenLight = document.getElementById('green');
const signalText = document.getElementById('signal-text');
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        video.srcObject = stream;
        log.innerText = "System Online: Scanning Lane 1";
    })
    .catch(err => {
        log.innerText = "SENSOR ERROR: " + err.message;
    });
async function processTraffic() {
    log.innerText = "Processing Lane Density...";
    
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    try {
        const result = await Tesseract.recognize(canvas.toDataURL(), 'eng');
        const text = result.data.text.replace(/[^A-Z0-9]/gi, "");
        const density = text.length;

        log.innerText = `Lane Density Score: ${density}`;

        if (density > 3) {
            triggerGreen();
        }
    } catch (error) {
        console.error("OCR Failed:", error);
    }
}

function triggerGreen() {
    redLight.classList.remove('active-red');
    greenLight.classList.add('active-green');
    signalText.innerText = "STATUS: GREEN (TRAFFIC DETECTED)";
    signalText.style.color = "#2ecc71";
    setTimeout(() => {
        greenLight.classList.remove('active-green');
        redLight.classList.add('active-red');
        signalText.innerText = "STATUS: RED (WAITING)";
        signalText.style.color = "#ffffff";
    }, 6000);
}

setInterval(processTraffic, 10000);
