const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const textToolbar = document.getElementById('textToolbar');
const extraToolbar = document.getElementById('extraToolbar');
const inlineTextEditor = document.getElementById('inlineTextEditor');

canvas.width = 600;
canvas.height = 600;


let pumpkins = []; 
let selectedBackground = null;
let selectedBackgroundImage = null;
let backgroundDarken = 0; 
let extras = []; 
let texts = [];
let selectedText = null;
let selectedElement = null; 
let draggedElement = null;
let dragOffset = {x: 0, y: 0};
let nextId = 1;

const pumpkinImages = {};
for (let i = 1; i <= 3; i++) {
    const img = new Image();
    img.src = `./assets/pumpkin-${i}.png`;
    pumpkinImages[i] = img;
}

const backgroundImages = {};
for (let i = 1; i <= 3; i++) {
    const img = new Image();
    img.src = `./assets/meme-bg-${i}.png`;
    backgroundImages[i] = img;
}

const extraImages = {};
for (let i = 1; i <= 3; i++) {
    const img = new Image();
    img.src = `./assets/extra-${i}.png`;
    extraImages[i] = img;
}

document.querySelectorAll('[data-type="pumpkin"]').forEach(box => {
    box.addEventListener('click', () => {
        const pumpkinType = box.dataset.id;
        const newPumpkin = {
            id: nextId++,
            type: pumpkinType,
            img: pumpkinImages[pumpkinType],
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: 300,
            height: 300,
            scale: 1
        };
        pumpkins.push(newPumpkin);
        render();
    });
});

document.querySelectorAll('[data-type="background"]').forEach(box => {
    box.addEventListener('click', () => {
        document.querySelectorAll('[data-type="background"]').forEach(b => b.classList.remove('selected'));
        box.classList.add('selected');
        selectedBackground = box.dataset.id;
        selectedBackgroundImage = backgroundImages[selectedBackground];
        render();
    });
});

document.querySelectorAll('[data-type="extra"]').forEach(box => {
    box.addEventListener('click', () => {
        const extraId = nextId++;
        const extraType = box.dataset.id;
        extras.push({
            id: extraId,
            type: extraType,
            img: extraImages[extraType],
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: 100,
            height: 100,
            scale: 1
        });
        render();
    });
});

document.getElementById('addTextBtn').addEventListener('click', () => {
    const textId = nextId++;
    texts.push({
        id: textId,
        text: 'Click me to edit',
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 32,
        color: '#ffffff',
        font: 'Arial',
        uppercase: false
    });
    render();
});

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('dblclick', handleDoubleClick);

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

let lastTouchTime = 0;
let touchCount = 0;

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (let i = texts.length - 1; i >= 0; i--) {
        const text = texts[i];
        const fontFamily = text.font || 'Arial';
        const fontWeight = (fontFamily === 'Arial') ? 'bold' : 'normal';
        ctx.font = `${fontWeight} ${text.size}px "${fontFamily}"`;
        const displayText = text.uppercase ? text.text.toUpperCase() : text.text;
        const metrics = ctx.measureText(displayText);
        const textWidth = metrics.width;
        const textHeight = text.size;

        if (x >= text.x - textWidth/2 && x <= text.x + textWidth/2 &&
            y >= text.y - textHeight && y <= text.y) {
            selectedText = text;
            draggedElement = {type: 'text', element: text};
            dragOffset = {x: x - text.x, y: y - text.y};
            selectedElement = null;
            showTextToolbar();
            hideExtraToolbar();
            render();
            return;
        }
    }

    for (let i = extras.length - 1; i >= 0; i--) {
        const extra = extras[i];
        const displayWidth = extra.width * extra.scale;
        const displayHeight = extra.height * extra.scale;
        if (x >= extra.x - displayWidth/2 && x <= extra.x + displayWidth/2 &&
            y >= extra.y - displayHeight/2 && y <= extra.y + displayHeight/2) {
            draggedElement = {type: 'extra', element: extra};
            dragOffset = {x: x - extra.x, y: y - extra.y};
            selectedText = null;
            selectedElement = extra;
            hideTextToolbar();
            showExtraToolbar();
            render();
            return;
        }
    }

    for (let i = pumpkins.length - 1; i >= 0; i--) {
        const pumpkin = pumpkins[i];
        const displayWidth = pumpkin.width * pumpkin.scale;
        const displayHeight = pumpkin.height * pumpkin.scale;
        if (x >= pumpkin.x - displayWidth/2 && x <= pumpkin.x + displayWidth/2 &&
            y >= pumpkin.y - displayHeight/2 && y <= pumpkin.y + displayHeight/2) {
            draggedElement = {type: 'pumpkin', element: pumpkin};
            dragOffset = {x: x - pumpkin.x, y: y - pumpkin.y};
            selectedText = null;
            selectedElement = pumpkin;
            hideTextToolbar();
            showExtraToolbar();
            render();
            return;
        }
    }

    selectedText = null;
    selectedElement = null;
    hideTextToolbar();
    hideExtraToolbar();
    render();
}

function handleMouseMove(e) {
    if (!draggedElement) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    draggedElement.element.x = x - dragOffset.x;
    draggedElement.element.y = y - dragOffset.y;

    render();
}

function handleMouseUp(e) {
    draggedElement = null;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTouchTime;
    
    if (tapLength < 500 && tapLength > 0) {

        touchCount++;
        if (touchCount === 2) {
            handleDoubleClick({ clientX: touch.clientX, clientY: touch.clientY });
            touchCount = 0;
            lastTouchTime = 0;
            return;
        }
    } else {
        touchCount = 1;
    }
    
    lastTouchTime = currentTime;
    
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchEnd(e) {
    e.preventDefault();
    handleMouseUp(e);
}

function handleDoubleClick(e) {
    if (!selectedText) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = selectedText.x * (rect.width / canvas.width);
    const canvasY = selectedText.y * (rect.height / canvas.height);
    
    inlineTextEditor.value = selectedText.text;
    inlineTextEditor.style.display = 'block';
    
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
        inlineTextEditor.style.left = '50%';
        inlineTextEditor.style.top = '50%';
        inlineTextEditor.style.transform = 'translate(-50%, -50%)';
        inlineTextEditor.style.position = 'fixed';
        inlineTextEditor.style.zIndex = '1000';
        inlineTextEditor.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        inlineTextEditor.style.color = '#fff';
        inlineTextEditor.style.border = '3px solid #FF7518';
        inlineTextEditor.style.borderRadius = '10px';
        inlineTextEditor.style.fontSize = '18px';
        inlineTextEditor.style.padding = '12px';
        inlineTextEditor.style.minWidth = '200px';
    } else {
        // Desktop positioning
        inlineTextEditor.style.left = (canvasX - 100) + 'px';
        inlineTextEditor.style.top = (canvasY - 20) + 'px';
        inlineTextEditor.style.transform = 'none';
        inlineTextEditor.style.position = 'absolute';
        inlineTextEditor.style.zIndex = '99';
        inlineTextEditor.style.backgroundColor = 'transparent';
        inlineTextEditor.style.fontSize = (selectedText.size * (rect.width / canvas.width)) + 'px';
    }
    
    inlineTextEditor.style.color = selectedText.color;
    inlineTextEditor.style.fontFamily = selectedText.font || 'Arial';
    
    if (selectedText.uppercase) {
        inlineTextEditor.classList.add('uppercase');
    } else {
        inlineTextEditor.classList.remove('uppercase');
    }
    
    // Focus and select with a small delay for mobile
    setTimeout(() => {
        inlineTextEditor.focus();
        inlineTextEditor.select();
    }, 100);
}

// Text toolbar functions
function showTextToolbar() {
    if (!selectedText) return;
    
    textToolbar.style.display = 'flex';
    document.getElementById('textColor').value = selectedText.color;
    document.getElementById('textFont').value = selectedText.font || 'Arial';
    document.getElementById('textSize').value = selectedText.size;
    document.getElementById('textSizeValue').textContent = selectedText.size;
}

function hideTextToolbar() {
    textToolbar.style.display = 'none';
}

// Extra/Pumpkin toolbar functions
function showExtraToolbar() {
    if (!selectedElement) return;
    
    extraToolbar.style.display = 'flex';
    const scalePercent = Math.round(selectedElement.scale * 100);
    document.getElementById('extraScale').value = scalePercent;
    document.getElementById('scaleValue').textContent = scalePercent + '%';
}

function hideExtraToolbar() {
    extraToolbar.style.display = 'none';
}

document.getElementById('textColor').addEventListener('input', (e) => {
    if (selectedText) {
        selectedText.color = e.target.value;
        render();
    }
});

document.getElementById('textFont').addEventListener('change', (e) => {
    if (selectedText) {
        selectedText.font = e.target.value;
        // Auto uppercase for custom fonts, normal for Arial
        selectedText.uppercase = (e.target.value !== 'Arial');
        render();
    }
});

document.getElementById('textSize').addEventListener('input', (e) => {
    if (selectedText) {
        selectedText.size = parseInt(e.target.value);
        document.getElementById('textSizeValue').textContent = selectedText.size;
        render();
    }
});

document.getElementById('centerHorizontal').addEventListener('click', () => {
    if (selectedText) {
        selectedText.x = canvas.width / 2;
        render();
    }
});

document.getElementById('centerVertical').addEventListener('click', () => {
    if (selectedText) {
        selectedText.y = canvas.height / 2;
        render();
    }
});

document.getElementById('deleteText').addEventListener('click', () => {
    if (selectedText) {
        texts = texts.filter(t => t.id !== selectedText.id);
        selectedText = null;
        hideTextToolbar();
        render();
    }
});

// Extra/Pumpkin toolbar controls
document.getElementById('extraScale').addEventListener('input', (e) => {
    if (selectedElement) {
        const scalePercent = parseInt(e.target.value);
        selectedElement.scale = scalePercent / 100;
        document.getElementById('scaleValue').textContent = scalePercent + '%';
        render();
    }
});

document.getElementById('deleteExtra').addEventListener('click', () => {
    if (selectedElement) {
        // Check if it's a pumpkin
        const pumpkinIndex = pumpkins.indexOf(selectedElement);
        if (pumpkinIndex !== -1) {
            pumpkins.splice(pumpkinIndex, 1);
        } else {
            // It's an extra
            extras = extras.filter(ex => ex !== selectedElement);
        }
        selectedElement = null;
        hideExtraToolbar();
        render();
    }
});

// Darken background slider
document.getElementById('darkenSlider').addEventListener('input', (e) => {
    backgroundDarken = parseInt(e.target.value);
    document.getElementById('darkenValue').textContent = backgroundDarken + '%';
    render();
});

// Render canvas
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (selectedBackgroundImage && selectedBackgroundImage.complete) {
        ctx.drawImage(selectedBackgroundImage, 0, 0, canvas.width, canvas.height);
        
        // Apply darkening overlay if needed
        if (backgroundDarken > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${backgroundDarken / 100})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw pumpkins
    pumpkins.forEach(pumpkin => {
        if (pumpkin.img && pumpkin.img.complete) {
            const displayWidth = pumpkin.width * pumpkin.scale;
            const displayHeight = pumpkin.height * pumpkin.scale;
            
            ctx.drawImage(pumpkin.img, 
                pumpkin.x - displayWidth/2, 
                pumpkin.y - displayHeight/2, 
                displayWidth, 
                displayHeight);
            
            // Selection indicator
            if (pumpkin === selectedElement) {
                ctx.strokeStyle = '#FF7518';
                ctx.lineWidth = 3;
                ctx.strokeRect(pumpkin.x - displayWidth/2 - 5, pumpkin.y - displayHeight/2 - 5, 
                              displayWidth + 10, displayHeight + 10);
            }
        }
    });

    // Draw extras
    extras.forEach(extra => {
        const displayWidth = extra.width * extra.scale;
        const displayHeight = extra.height * extra.scale;
        
        if (extra.img && extra.img.complete) {
            ctx.drawImage(extra.img, 
                extra.x - displayWidth/2, 
                extra.y - displayHeight/2, 
                displayWidth, 
                displayHeight);
        }
        
        // Selection indicator
        if (extra === selectedElement) {
            ctx.strokeStyle = '#FF7518';
            ctx.lineWidth = 3;
            ctx.strokeRect(extra.x - displayWidth/2 - 5, extra.y - displayHeight/2 - 5, 
                          displayWidth + 10, displayHeight + 10);
        }
    });

    // Draw texts
    texts.forEach(text => {
        const fontFamily = text.font || 'Arial';
        // Use bold only for Arial, normal for custom fonts
        const fontWeight = (fontFamily === 'Arial') ? 'bold' : 'normal';
        ctx.font = `${fontWeight} ${text.size}px "${fontFamily}"`;
        ctx.fillStyle = text.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Apply uppercase if needed
        const displayText = text.uppercase ? text.text.toUpperCase() : text.text;
        
        // Outline
        ctx.strokeText(displayText, text.x, text.y);
        // Fill
        ctx.fillText(displayText, text.x, text.y);

        // Selection indicator
        if (text === selectedText) {
            ctx.strokeStyle = '#FF7518';
            ctx.lineWidth = 2;
            const metrics = ctx.measureText(displayText);
            const textWidth = metrics.width;
            const textHeight = text.size;
            ctx.strokeRect(text.x - textWidth/2 - 5, text.y - textHeight/2 - 5, 
                          textWidth + 10, textHeight + 10);
        }
    });
}

// Reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    // Reset all state
    pumpkins = [];
    selectedBackground = null;
    selectedBackgroundImage = null;
    backgroundDarken = 0;
    extras = [];
    texts = [];
    selectedText = null;
    selectedElement = null;
    draggedElement = null;
    
    // Reset darken slider
    document.getElementById('darkenSlider').value = 0;
    document.getElementById('darkenValue').textContent = '0%';
    
    // Remove all selections
    document.querySelectorAll('.option-box.selected').forEach(box => {
        box.classList.remove('selected');
    });
    
    // Hide toolbars
    hideTextToolbar();
    hideExtraToolbar();
    
    // Re-render
    render();
});

// Download button
document.getElementById('downloadBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'dumb-ahh-pumpkin-meme.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Inline text editor events
inlineTextEditor.addEventListener('blur', () => {
    if (selectedText && inlineTextEditor.value.trim()) {
        selectedText.text = inlineTextEditor.value;
        render();
    }
    inlineTextEditor.style.display = 'none';
});

inlineTextEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (selectedText && inlineTextEditor.value.trim()) {
            selectedText.text = inlineTextEditor.value;
            render();
        }
        inlineTextEditor.style.display = 'none';
        inlineTextEditor.blur();
    } else if (e.key === 'Escape') {
        inlineTextEditor.style.display = 'none';
        inlineTextEditor.blur();
    }
});

// Initial render
render();

// Mobile menu toggle function
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const burgerMenu = document.getElementById('burgerMenu');
    
    mobileMenu.classList.toggle('active');
    burgerMenu.classList.toggle('active');
}
