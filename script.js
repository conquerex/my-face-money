const URL = "https://teachablemachine.withgoogle.com/models/TzriknE80/";

let model, labelContainer, maxPredictions;
let lastValue = 0;

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

    // Update lastValue for sharing
    lastValue = roundedValue;
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
// Kakao SDK Initialization
function initKakao() {
    if (window.Kakao) {
        if (!Kakao.isInitialized()) {
            try {
                // 이 키는 Kakao Developers 콘솔에 등록된 도메인(localhost, pages.dev 등)에서만 동작합니다.
                Kakao.init('4c9888941673895e6922d3637e1795c3');
                console.log("Kakao SDK Initialized:", Kakao.isInitialized());
            } catch (e) {
                console.error("Kakao Init Error:", e);
            }
        }
    } else {
        console.error("Kakao SDK not found on window");
    }
}

// 초기화 호출
initKakao();

function shareX() {
    const valueText = document.getElementById('money-value').innerText;
    const text = `나의 얼굴 가치는 얼마일까? AI가 분석한 나의 얼굴 관상 결과: ${valueText}원! #MyFaceMoney #AI관상 #얼굴분석`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("링크가 복사되었습니다!");
    }).catch(err => {
        console.error('Copy failed', err);
        // Fallback for older browsers
        const tempInput = document.createElement("input");
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert("링크가 복사되었습니다!");
    });
}

function shareKakao() {
    // 실시간으로 초기화 상태 다시 확인
    if (!window.Kakao) {
        alert("카카오톡 SDK 로드에 실패했습니다. 페이지를 새로고침해 주세요.");
        return;
    }

    if (!Kakao.isInitialized()) {
        initKakao();
    }

    if (!Kakao.isInitialized()) {
        alert("카카오톡 초기화에 실패하여 공유 기능을 이용할 수 없습니다.");
        return;
    }

    const shareUrl = "https://my-face-money.pages.dev/";
    const shareTitle = '나의 얼굴 경제적 가치는?';
    const shareDesc = lastValue > 0
        ? `분석 결과, 당신은 ${lastValue.toLocaleString()}원권 얼굴입니다! AI 관상 분석 결과를 확인해보세요.`
        : '당신의 얼굴은 얼마의 가치가 있을까요? AI가 분석하는 나의 얼굴 관상과 경제적 가치를 측정해보세요!';

    try {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: shareTitle,
                description: shareDesc,
                imageUrl: 'https://my-face-money.pages.dev/og-image.webp',
                link: {
                    mobileWebUrl: shareUrl,
                    webUrl: shareUrl,
                },
            },
            buttons: [
                {
                    title: '나도 테스트하기',
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl,
                    },
                },
            ],
        });
    } catch (e) {
        console.error("Kakao Share Error:", e);
        alert("카카오톡 공유 도중 오류가 발생했습니다.");
    }
}
