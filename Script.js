const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture');
const resultDisplay = document.getElementById('plate-number');
const statusDisplay = document.getElementById('status');

// 1. Start the Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } // Uses back camera on mobile
        });
        video.srcObject = stream;
    } catch (err) {
        statusDisplay.innerText = "Error: Camera access denied.";
    }
}

// 2. Capture and Process Image
captureBtn.addEventListener('click', async () => {
    statusDisplay.innerText = "Processing...";
    
    // Draw current video frame to canvas
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 3. Run OCR (Tesseract.js)
    Tesseract.recognize(
        canvas.toDataURL('image/png'),
        'eng',
        { logger: m => console.log(m) } // Logs progress
    ).then(({ data: { text } }) => {
        // Simple Regex to filter for alphanumeric characters (Plate format)
        const cleanText = text.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        resultDisplay.innerText = cleanText || "No text found";
        statusDisplay.innerText = "Complete!";
    }).catch(err => {
        statusDisplay.innerText = "Recognition Error";
        console.error(err);
    });
});

startCamera();
