const CURRENCY_CONFIG = {
    KRW: {
        modelURL: "https://teachablemachine.withgoogle.com/models/TzriknE80/",
        prefix: "item_won_",
        moneyBg: "images/mymoney.webp",
        overlayColor: "#3d9180",
        strokeColor: "#183722",
        faceFrame: { right: '12%', top: '50%', left: 'auto', transform: 'translateY(-50%)', width: '29.75%', borderRadius: '50%' },
        faceFilter: "sepia(20%) hue-rotate(95deg) saturate(0.8) brightness(1.2) contrast(1.0)"
    },
    JPY: {
        modelURL: "https://teachablemachine.withgoogle.com/models/UvsKhD7ls/",
        prefix: "item_yen_",
        moneyBg: "images/mymoney.webp",
        overlayColor: "#3d9180",
        strokeColor: "#183722",
        faceFrame: { right: '12%', top: '50%', left: 'auto', transform: 'translateY(-50%)', width: '29.75%', borderRadius: '50%' },
        faceFilter: "sepia(20%) hue-rotate(95deg) saturate(0.8) brightness(1.2) contrast(1.0)"
    }
};

let currentCurrency = 'KRW';
let models = {
    KRW: null,
    JPY: null
};

// Elements
const imageInput = document.getElementById('image-input');
const facePreview = document.getElementById('face-preview');
const uploadArea = document.getElementById('upload-area');
const uploadContent = document.querySelector('.upload-content');
const previewContainer = document.getElementById('preview-container');
const loadingOverlay = document.getElementById('loading-overlay');
const resultArea = document.getElementById('result-area');
const labelContainerElement = document.getElementById('label-container');
const resultFace = document.getElementById('result-face');
const resultMoneyImg = document.getElementById('result-money-img');
const moneyValueDisplay = document.getElementById('money-value');
const moneyOverlayText = document.getElementById('money-overlay-text');
const totalValueText = document.getElementById('total-value-text');

const TRANSLATIONS = {
    ko: {
        subtitle: "AI 얼굴 가치 분석 및 관상 테스트",
        krw_label: "대한민국 원 (KRW)",
        jpy_label: "일본 엔화 (JPY)",
        usd_label: "미국 달러 (USD)",
        upload_text: "사진을 클릭하거나 드래그하여 업로드하세요",
        select_photo: "사진 선택하기",
        loading_text: "AI 모델 분석 중...",
        result_text_pre: "당신은 ",
        result_text_post: "입니다.",
        result_subtitle: "세부 분석 결과",
        retry_button: "다시 시도하기",
        how_it_works: "어떻게 계산되나요?",
        currency_unit: "권",
        face_preview_alt: "얼굴 미리보기",
        money_result_alt: "My Face Money - AI 분석 화폐 결과",
        your_face_alt: "당신의 얼굴",
        krw_unit: "원",
        jpy_unit: "엔"
    },
    ja: {
        subtitle: "AI顔価値分析＆観相テスト",
        krw_label: "韓国ウォン (KRW)",
        jpy_label: "日本円 (JPY)",
        usd_label: "米ドル (USD)",
        upload_text: "画像をクリックまたはドラッグしてアップロードしてください",
        select_photo: "사진 선택하기", // select photo
        loading_text: "AIモデル分析中...",
        result_text_pre: "あなたは ",
        result_text_post: "です。",
        result_subtitle: "詳細分析結果",
        retry_button: "もう一度試す",
        how_it_works: "どのように計算されますか？",
        currency_unit: "券",
        face_preview_alt: "顔のプレビュー",
        money_result_alt: "My Face Money - AI分析の通貨結果",
        your_face_alt: "あなたの顔",
        krw_unit: "ウォン",
        jpy_unit: "円"
    }
};

let currentLanguage = 'ko';

function updateUI() {
    const t = TRANSLATIONS[currentLanguage];

    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.innerText = t[key];
        }
    });

    // Update alt text
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const key = el.getAttribute('data-i18n-alt');
        if (t[key]) {
            el.alt = t[key];
        }
    });

    // Update active state of lang buttons
    document.querySelectorAll('.language-selector button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`lang-${currentLanguage}`);
    if (activeBtn) activeBtn.classList.add('active');
}

function setLanguage(lang) {
    if (currentLanguage === lang) return;
    currentLanguage = lang;
    updateUI();
}

// Initialize UI
updateUI();

async function setCurrency(currency) {
    if (currentCurrency === currency) return;

    currentCurrency = currency;

    // Update UI active state
    document.querySelectorAll('.currency-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`select-${currency.toLowerCase()}`).classList.add('active');

    // Reset results if any
    resetUpload();

    // Preload model if not loaded
    loadModel(currency);
}

async function loadModel(currency) {
    if (models[currency]) return models[currency];

    const config = CURRENCY_CONFIG[currency];
    const modelURL = config.modelURL + "model.json";
    const metadataURL = config.modelURL + "metadata.json";

    try {
        console.log(`Loading ${currency} model...`);
        const model = await tmImage.load(modelURL, metadataURL);
        models[currency] = model;
        console.log(`${currency} model loaded successfully`);
        return model;
    } catch (e) {
        console.error(`Error loading ${currency} model:`, e);
        alert(`${currency} 모델을 불러오는 데 실패했습니다.`);
        return null;
    }
}

// Initial load
loadModel('KRW');

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
    uploadContent.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    loadingOverlay.classList.remove('hidden');
    resultArea.classList.add('hidden');
    labelContainerElement.innerHTML = '';

    await new Promise(resolve => setTimeout(resolve, 2000));
    predict();
}

async function predict() {
    const model = await loadModel(currentCurrency);
    if (!model) return;

    const prediction = await model.predict(facePreview);
    prediction.sort((a, b) => b.probability - a.probability);

    const config = CURRENCY_CONFIG[currentCurrency];

    let totalValue = 0;
    prediction.forEach(p => {
        let className = p.className;
        // Fix for JPY model where 10000 yen is labeled as "Class 3"
        if (currentCurrency === 'JPY' && className === 'Class 3') {
            className = '10000';
        }

        const value = parseFloat(className.replace(/,/g, ''));
        if (!isNaN(value)) {
            totalValue += value * p.probability;
        }
    });

    loadingOverlay.classList.add('hidden');
    resultArea.classList.remove('hidden');

    const t = TRANSLATIONS[currentLanguage];
    const roundedValue = Math.round(totalValue);
    const formattedTotal = roundedValue.toLocaleString();

    const unit = currentCurrency === 'KRW' ? t.krw_unit : t.jpy_unit;
    moneyValueDisplay.innerText = formattedTotal;
    totalValueText.innerHTML = `${t.result_text_pre}<span id="money-value">${formattedTotal}</span>${unit}${t.currency_unit}${t.result_text_post}`;
    moneyValueDisplay.innerText = formattedTotal; // Re-sync just in case

    moneyOverlayText.innerText = roundedValue;
    moneyOverlayText.style.color = config.overlayColor;
    moneyOverlayText.style.webkitTextStrokeColor = config.strokeColor;

    // Apply dynamic face frame positioning
    const faceFrame = document.querySelector('.face-frame');
    Object.assign(faceFrame.style, config.faceFrame);
    resultFace.style.filter = config.faceFilter;

    moneyOverlayText.style.left = '7%';
    moneyOverlayText.style.bottom = '8%';
    moneyOverlayText.style.fontSize = '8.0cqw';
    moneyOverlayText.style.fontFamily = "'Roboto Mono', monospace";
    moneyOverlayText.style.letterSpacing = "-0.05em";

    resultMoneyImg.src = config.moneyBg;

    prediction.forEach((p, i) => {
        // Show all results even if probability is low

        const percentage = (p.probability * 100).toFixed(1);
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.style.animationDelay = `${i * 0.1}s`;

        let className = p.className;
        // Fix for JPY model where 10000 yen is labeled as "Class 3"
        if (currentCurrency === 'JPY' && className === 'Class 3') {
            className = '10000';
        }

        const rawValue = className.replace(/,/g, '');
        const paddedValue = rawValue.padStart(5, '0');
        const imgSrc = `images/${config.prefix}${paddedValue}.png`;
        const formattedLabel = parseFloat(rawValue).toLocaleString();

        resultItem.innerHTML = `
            <div class="result-label-row">
                <div class="label-with-icon">
                    <img src="${imgSrc}" class="item-icon" alt="${formattedLabel}${unit}" onerror="this.style.display='none'">
                    <span class="currency-label">${formattedLabel}${unit}</span>
                </div>
                <span class="percentage-value">${percentage}%</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: 0%"></div>
            </div>
        `;

        labelContainerElement.appendChild(resultItem);

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
