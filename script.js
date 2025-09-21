document.addEventListener('DOMContentLoaded', () => {
    
    // 🔥 YOUR DEPLOYED URL - ALREADY CONFIGURED!
    const API_BASE_URL = 'https://gitrepo-eakc.onrender.com';
    
    console.log('🚀 Using API Base URL:', API_BASE_URL);
    
    // DOM Elements
    const textTabButton = document.getElementById('text-tab-button');
    const imageTabButton = document.getElementById('image-tab-button');
    const textInputSection = document.getElementById('text-input-section');
    const imageInputSection = document.getElementById('image-input-section');
    const cameraViewSection = document.getElementById('camera-view-section');
    const verifyForm = document.getElementById('verify-form');
    const textInput = document.getElementById('text-input');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const startCameraButton = document.getElementById('start-camera-button');
    const videoElement = document.getElementById('video-element');
    const canvasElement = document.getElementById('canvas-element');
    const captureButton = document.getElementById('capture-button');
    const cancelCameraButton = document.getElementById('cancel-camera-button');
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const resultsContainer = document.getElementById('results-container');
    
    let mediaStream = null;
    
    // Tab Switching
    function showTextInput() {
        textInputSection.style.display = 'block';
        imageInputSection.style.display = 'none';
        cameraViewSection.style.display = 'none';
        textTabButton.classList.add('bg-slate-700/80', 'text-cyan-300');
        textTabButton.classList.remove('bg-slate-800/60', 'text-slate-400');
        imageTabButton.classList.add('bg-slate-800/60', 'text-slate-400');
        imageTabButton.classList.remove('bg-slate-700/80', 'text-cyan-300');
        stopCamera();
    }
    
    function showImageInput() {
        textInputSection.style.display = 'none';
        imageInputSection.style.display = 'block';
        cameraViewSection.style.display = 'none';
        imageTabButton.classList.add('bg-slate-700/80', 'text-cyan-300');
        imageTabButton.classList.remove('bg-slate-800/60', 'text-slate-400');
        textTabButton.classList.add('bg-slate-800/60', 'text-slate-400');
        textTabButton.classList.remove('bg-slate-700/80', 'text-cyan-300');
    }
    
    // UI State Management
    function showLoading(message) {
        resultsContainer.innerHTML = '';
        errorContainer.innerHTML = '';
        loadingContainer.innerHTML = `
            <div class="animate-fade-in text-center p-4 bg-slate-700/50 rounded-lg">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                <p class="text-slate-300">${message}</p>
            </div>`;
    }
    
    function showError(message) {
        loadingContainer.innerHTML = '';
        errorContainer.innerHTML = `
            <div class="animate-fade-in text-center p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <p class="font-bold text-red-400">❌ Error</p>
                <p class="text-red-300">${message}</p>
                <p class="text-red-200 text-sm mt-2">Check browser console (F12) for details</p>
            </div>`;
    }
    
   // --- NEW HELPER FUNCTIONS TO RENDER DETAILED DATA ---

function renderSection(title, content) {
    if (!content) return '';
    return `
        <div class="mt-4 pt-4 border-t border-slate-700">
            <h3 class="text-xl font-bold text-cyan-400 mb-2">${title}</h3>
            ${content}
        </div>
    `;
}

function renderRedFlags(data) {
    const redFlags = data?.risk_and_red_flags?.red_flags;
    if (!redFlags || redFlags.length === 0) return '';
    
    const content = redFlags.map(flag => {
        let severityColor = 'text-yellow-400';
        if (flag.severity === 'Critical') severityColor = 'text-red-400';
        if (flag.severity === 'High') severityColor = 'text-orange-400';

        return `
            <div class="bg-slate-900/50 p-3 rounded-lg mb-2">
                <p class="font-bold ${severityColor}">[${flag.severity}] ${flag.issue}</p>
                <p class="text-sm text-slate-300 mt-1"><strong class="text-slate-100">Why it matters:</strong> ${flag.why_it_matters}</p>
                <p class="text-sm text-slate-400 mt-1"><strong class="text-slate-200">Mitigation:</strong> ${flag.mitigation}</p>
            </div>
        `;
    }).join('');

    return renderSection('🚨 Red Flags', `<div class="space-y-2">${content}</div>`);
}

function renderActionItems(data) {
    const recommendedActions = data?.verdict?.recommended_actions;
    const literacyTips = data?.digital_literacy_tips;
    let content = '';

    if (recommendedActions && recommendedActions.length > 0) {
        content += '<h4 class="font-semibold text-slate-100 mb-1">Recommended Actions</h4>';
        content += '<ul class="list-disc list-inside space-y-1 text-slate-300">';
        content += recommendedActions.map(action => `<li>${action}</li>`).join('');
        content += '</ul>';
    }

    if (literacyTips && literacyTips.length > 0) {
        content += `<h4 class="font-semibold text-slate-100 mt-3 mb-1">💡 Pro Tips</h4>`;
        content += '<ul class="list-disc list-inside space-y-1 text-slate-300">';
        content += literacyTips.map(tip => `<li><strong>(${tip.category})</strong> ${tip.tip}</li>`).join('');
        content += '</ul>';
    }

    return renderSection('✅ Next Steps', content);
}

function renderSectionBreakdown(data) {
    const keySections = data?.explanations?.key_sections;
    if (!keySections || keySections.length === 0) return '';

    const content = keySections.map(section => {
         let importanceColor = 'bg-slate-600';
        if (section.importance === 'High') importanceColor = 'bg-orange-600';
        if (section.importance === 'Medium') importanceColor = 'bg-yellow-600';

        return `
            <div class="bg-slate-900/50 p-3 rounded-lg">
                <div class="flex justify-between items-center">
                    <p class="font-bold text-slate-100">${section.section_title}</p>
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full ${importanceColor}">${section.importance}</span>
                </div>
                <p class="text-sm text-slate-300 mt-1">${section.layman_summary}</p>
            </div>
        `;
    }).join('');
    return renderSection('📝 Document Breakdown', `<div class="space-y-2">${content}</div>`);
}

function renderVerifiedLinks(data) {
    const links = data?.verified_links;
    if (!links || links.length === 0) return '';

    const content = links.map(link => `
        <div class="bg-slate-900/50 p-3 rounded-lg">
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="font-bold text-cyan-400 hover:underline">${link.title}</a>
            <p class="text-sm text-slate-400 mt-1">${link.description}</p>
        </div>
    `).join('');
    return renderSection('📚 Resources & Further Reading', `<div class="space-y-2">${content}</div>`);
}


function showResults(data) {
    loadingContainer.innerHTML = '';
    errorContainer.innerHTML = '';
    console.log('📊 API Response:', data);
    
    // Main summary data
    let assessment = data.verdict?.overall_assessment || 'Analysis completed';
    let riskLevel = data.verdict?.risk_level || 'Unknown';
    let score = data.context_aware_credibility_score?.overall_score || 0;
    
    let riskColorClass = 'text-slate-300';
    if (riskLevel === 'Low') riskColorClass = 'text-green-400';
    if (riskLevel === 'Medium') riskColorClass = 'text-yellow-400';
    if (riskLevel === 'High') riskColorClass = 'text-orange-400';
    if (riskLevel === 'Critical') riskColorClass = 'text-red-500';
    
    // Build the full results HTML
    let resultsHtml = `
        <div class="animate-fade-in bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
            <h2 class="text-2xl font-bold text-slate-100 border-b border-slate-600 pb-2">
                ✅ Analysis Complete
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 class="font-semibold text-cyan-400">Credibility Score</h3>
                    <p class="text-3xl font-light text-slate-100">${score}/100</p>
                </div>
                <div>
                    <h3 class="font-semibold text-cyan-400">Risk Level</h3>
                    <p class="text-xl font-bold ${riskColorClass}">${riskLevel}</p>
                </div>
            </div>
            <div>
                <h3 class="font-semibold text-cyan-400">Assessment</h3>
                <p class="text-slate-300">${assessment}</p>
            </div>
        </div>`;

    // Append detailed sections
    resultsHtml += renderRedFlags(data);
    resultsHtml += renderActionItems(data);
    resultsHtml += renderSectionBreakdown(data);
    resultsHtml += renderVerifiedLinks(data);

    resultsContainer.innerHTML = resultsHtml;
}
    
    // API Functions
    async function verifyText(textToVerify) {
        showLoading('🔍 Analyzing text content...');
        
        console.log('📤 Sending text to:', `${API_BASE_URL}/dashboard`);
        
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ query: textToVerify,
                     ques : ""
                 }),
            });
            
            console.log('📥 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            showResults(data);
            
        } catch (err) {
            console.error('❌ Text analysis error:', err);
            showError(`Failed to analyze text: ${err.message}`);
        }
    }
    
    async function verifyFile(file) {
        if (!file) return;
        
        showLoading('📄 Uploading and analyzing file...');
        
        console.log('📤 Sending file to:', `${API_BASE_URL}/pdf`);
        console.log('📋 File details:', { name: file.name, size: file.size, type: file.type });
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch(`${API_BASE_URL}/pdf`, {
                method: 'POST',
                body: formData,
            });
            
            console.log('📥 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            showResults(data);
            
        } catch (err) {
            console.error('❌ File analysis error:', err);
            showError(`Failed to analyze file: ${err.message}`);
        }
    }
    
    // Camera Functions
    async function startCamera() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = mediaStream;
            imageInputSection.style.display = 'none';
            cameraViewSection.style.display = 'block';
        } catch (err) {
            showError('Camera access denied. Please check permissions.');
            console.error('Camera error:', err);
        }
    }
    
    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        showImageInput();
    }
    
    function capturePhoto() {
        const width = videoElement.videoWidth;
        const height = videoElement.videoHeight;
        canvasElement.width = width;
        canvasElement.height = height;
        const context = canvasElement.getContext('2d');
        context.drawImage(videoElement, 0, 0, width, height);
        
        canvasElement.toBlob(blob => {
            const imageFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
            stopCamera();
            verifyFile(imageFile);
        }, 'image/jpeg');
    }
    
    // Event Listeners
    textTabButton.addEventListener('click', showTextInput);
    imageTabButton.addEventListener('click', showImageInput);
    
    verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = textInput.value.trim();
        if (query) {
            verifyText(query);
        } else {
            showError('Please enter some text to analyze');
        }
    });
    
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            verifyFile(fileInput.files[0]);
        }
    });
    
    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-cyan-600', 'bg-slate-700/30');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-cyan-600', 'bg-slate-700/30');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-cyan-600', 'bg-slate-700/30');
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            verifyFile(e.dataTransfer.files[0]);
        }
    });
    
    // Camera buttons
    startCameraButton.addEventListener('click', startCamera);
    captureButton.addEventListener('click', capturePhoto);
    cancelCameraButton.addEventListener('click', stopCamera);
    
    // Set year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize
    showTextInput();
    
    // Test connection
    console.log('🎯 Frontend loaded! Ready to test with:', API_BASE_URL);
});

document.addEventListener("DOMContentLoaded", function () {
    const textTabBtn = document.getElementById("text-tab-button");
    const imageTabBtn = document.getElementById("image-tab-button");
    const textSection = document.getElementById("text-input-section");
    const imageSection = document.getElementById("image-input-section");

    textTabBtn.addEventListener("click", function () {
        textSection.style.display = "";
        imageSection.style.display = "none";
        textTabBtn.classList.add("bg-slate-900", "text-cyan-400");
        imageTabBtn.classList.remove("bg-slate-900", "text-cyan-400");
    });

    imageTabBtn.addEventListener("click", function () {
        textSection.style.display = "none";
        imageSection.style.display = "";
        imageTabBtn.classList.add("bg-slate-900", "text-cyan-400");
        textTabBtn.classList.remove("bg-slate-900", "text-cyan-400");
    });
});
