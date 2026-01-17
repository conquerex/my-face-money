const URL = "https://teachablemachine.withgoogle.com/models/TzriknE80/";

let model, labelContainer, maxPredictions;

// Load the image model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully");
    } catch (e) {
        console.error("Error loading model:", e);
        alert("모델을 불러오는 데 실패했습니다.");
    }
}

// Initialize on page load
init();

const imageInput = document.getElementById('image-input');
const facePreview = document.getElementById('face-preview');
const uploadArea = document.getElementById('upload-area');
const uploadContent = document.querySelector('.upload-content');
const previewContainer = document.getElementById('preview-container');
const loadingOverlay = document.getElementById('loading-overlay');
const resultArea = document.getElementById('result-area');
const labelContainerElement = document.getElementById('label-container');
const resultFace = document.getElementById('result-face');

imageInput.addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (event) {
            facePreview.src = event.target.result;
            resultFace.src = event.target.result;
            startAnalysis();
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

async function startAnalysis() {
    // UI Transitions
    uploadContent.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    loadingOverlay.classList.remove('hidden');
    resultArea.classList.add('hidden');
    labelContainerElement.innerHTML = '';

    // Wait a bit for the "scanning" effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    predict();
}

async function predict() {
    if (!model) {
        alert("모델이 아직 로드되지 않았습니다.");
        return;
    }

    const prediction = await model.predict(facePreview);

    // Sort predictions by probability (highest first)
    prediction.sort((a, b) => b.probability - a.probability);

    // Calculate sum of (Result * Probability)
    let totalValue = 0;
    prediction.forEach(p => {
        const value = parseFloat(p.className.replace(/,/g, ''));
        if (!isNaN(value)) {
            totalValue += value * p.probability;
        }
    });

    loadingOverlay.classList.add('hidden');
    resultArea.classList.remove('hidden');

    // Update total value text
    const roundedValue = Math.round(totalValue);
    const formattedTotal = roundedValue.toLocaleString();
    document.getElementById('money-value').innerText = formattedTotal;
    document.getElementById('money-overlay-text').innerText = roundedValue; // No comma here

    prediction.forEach((p, i) => {
        const percentage = (p.probability * 100).toFixed(1);

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.style.animationDelay = `${i * 0.1}s`;

        const formattedLabel = parseFloat(p.className.replace(/,/g, '')).toLocaleString();

        resultItem.innerHTML = `
            <div class="result-label-row">
                <span>${formattedLabel}원</span>
                <span>${percentage}%</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: 0%"></div>
            </div>
        `;

        labelContainerElement.appendChild(resultItem);

        // Animate progress bar
        setTimeout(() => {
            const bar = resultItem.querySelector('.progress-bar-fill');
            if (bar) bar.style.width = `${percentage}%`;
        }, 100 + (i * 100));
    });


}

function resetUpload() {
    imageInput.value = '';
    uploadContent.classList.remove('hidden');
    previewContainer.classList.add('hidden');
    resultArea.classList.add('hidden');
    loadingOverlay.classList.add('hidden');
    labelContainerElement.innerHTML = '';
}

// Drag and drop support
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--glass-border)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--glass-border)';

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        imageInput.files = e.dataTransfer.files;
        const reader = new FileReader();
        reader.onload = function (event) {
            facePreview.src = event.target.result;
            resultFace.src = event.target.result;
            startAnalysis();
        };
        reader.readAsDataURL(e.dataTransfer.files[0]);
    }
});

