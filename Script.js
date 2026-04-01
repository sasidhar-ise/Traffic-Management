const video = document.getElementById('video');
const canvas = document.getElementById('processing-canvas');
const captureBtn = document.getElementById('capture-btn');
const resultDiv = document.getElementById('result');
const statusDiv = document.getElementById('status');


navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => { 
        video.srcObject = stream; 
        statusDiv.innerText = "Status: Ready to Scan";
    })
    .catch(err => { statusDiv.innerText = "Error: " + err.message; });


captureBtn.addEventListener('click', async () => {
    statusDiv.innerText = "Status: Capturing...";
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);


    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
        let val = avg > 128 ? 255 : 0; 
        data[i] = data[i + 1] = data[i + 2] = val;
    }
    ctx.putImageData(imageData, 0, 0);
    

    statusDiv.innerText = "Status: Analyzing Text...";

    
    Tesseract.recognize(canvas.toDataURL(), 'eng', {
        logger: m => console.log(m.progress)
    }).then(({ data: { text } }) => {
        
        const plate = text.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        resultDiv.innerText = "NUMBER: " + (plate || "NOT DETECTED");
        statusDiv.innerText = "Status: Scan Complete";
    }).catch(e => {
        statusDiv.innerText = "Status: Error Processing";
        console.error(e);
    });
});
