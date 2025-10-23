// PFP Generator functionality
let uploadedImage = null;
let pfpDesign = null;
let canvas = document.getElementById('pfpCanvas');
let ctx = canvas.getContext('2d');

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Load PFP design overlay
const designImg = new Image();
designImg.src = './assets/pfp-design.png';
designImg.onload = () => {
    pfpDesign = designImg;
};

// Initialize canvas with placeholder
function initCanvas() {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#999';
    ctx.font = '16px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No image uploaded', canvas.width / 2, canvas.height / 2);
}

// Upload button click
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                uploadedImage = img;
                drawCircularImage(img);
                enableButtons();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Draw image in circular format with PFP design overlay
function drawCircularImage(img) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions to fit image in circle
    const size = Math.min(img.width, img.height);
    const x = (img.width - size) / 2;
    const y = (img.height - size) / 2;
    
    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // Draw uploaded image
    ctx.drawImage(img, x, y, size, size, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Draw PFP design overlay on top
    if (pfpDesign) {
        ctx.drawImage(pfpDesign, 0, 0, canvas.width, canvas.height);
    }
}

// Enable Reset and Download buttons
function enableButtons() {
    resetBtn.disabled = false;
    downloadBtn.disabled = false;
}

// Disable Reset and Download buttons
function disableButtons() {
    resetBtn.disabled = true;
    downloadBtn.disabled = true;
}

// Reset button click
resetBtn.addEventListener('click', () => {
    uploadedImage = null;
    fileInput.value = '';
    initCanvas();
    disableButtons();
});

// Download button click
downloadBtn.addEventListener('click', () => {
    if (uploadedImage) {
        // Create a temporary canvas for the download
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = 1000;
        downloadCanvas.height = 1000;
        const downloadCtx = downloadCanvas.getContext('2d');
        
        // Draw with transparency for circular shape
        downloadCtx.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height);
        
        const size = Math.min(uploadedImage.width, uploadedImage.height);
        const x = (uploadedImage.width - size) / 2;
        const y = (uploadedImage.height - size) / 2;
        
        // Create circular clipping path
        downloadCtx.save();
        downloadCtx.beginPath();
        downloadCtx.arc(downloadCanvas.width / 2, downloadCanvas.height / 2, downloadCanvas.width / 2, 0, Math.PI * 2);
        downloadCtx.closePath();
        downloadCtx.clip();
        
        // Draw uploaded image
        downloadCtx.drawImage(uploadedImage, x, y, size, size, 0, 0, downloadCanvas.width, downloadCanvas.height);
        downloadCtx.restore();
        
        // Draw PFP design overlay on top
        if (pfpDesign) {
            downloadCtx.drawImage(pfpDesign, 0, 0, downloadCanvas.width, downloadCanvas.height);
        }
        
        // Download
        downloadCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dumb-ahh-pumpkin-pfp.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }
});

// Initialize canvas on page load
initCanvas();

// Mobile menu toggle function
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const burgerMenu = document.getElementById('burgerMenu');
    
    mobileMenu.classList.toggle('active');
    burgerMenu.classList.toggle('active');
}
