document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatButton = document.getElementById('chatButton');
    const chatContainer = document.getElementById('chatContainer');
    const closeChat = document.getElementById('closeChat');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const startCall = document.getElementById('startCall');
    const endCall = document.getElementById('endCall');
    const videoContainer = document.getElementById('videoContainer');

    // Audio elements
    const typingSound = new Audio('/static/sounds/typing.mp3');
    const messageSound = new Audio('/static/sounds/message.mp3');

    // State variables
    let isCallActive = false;
    let ws = null;
    let mediaRecorder = null;
    let audioContext = null;
    let audioStream = null;
    let videoStream = null;
    let userName = null;
    let userId = null;

    // GDPR Consent Modal
    function showGDPRModal() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'gdpr-modal';
            modal.innerHTML = `
                <div class="gdpr-content">
                    <h2>Data Protection Notice</h2>
                    <p>We collect and process your data according to GDPR regulations:</p>
                    <ul>
                        <li>Chat transcripts</li>
                        <li>Voice recordings (when enabled)</li>
                        <li>Video streams (when enabled)</li>
                    </ul>
                    <div class="gdpr-form">
                        <input type="text" id="userName" placeholder="Your name" required>
                        <label>
                            <input type="checkbox" id="gdprConsent" required>
                            I agree to the data processing
                        </label>
                        <button id="gdprSubmit">Continue</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const submitBtn = document.getElementById('gdprSubmit');
            const nameInput = document.getElementById('userName');
            const consentCheckbox = document.getElementById('gdprConsent');

            submitBtn.addEventListener('click', async () => {
                if (nameInput.value && consentCheckbox.checked) {
                    try {
                        const response = await fetch('/api/gdpr-consent', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                user_name: nameInput.value,
                                consent: true
                            })
                        });
                        const data = await response.json();
                        userName = nameInput.value;
                        userId = data.user_id;
                        localStorage.setItem('chatToken', data.token);
                        modal.remove();
                        resolve(true);
                    } catch (error) {
                        console.error('GDPR consent error:', error);
                        resolve(false);
                    }
                }
            });
        });
    }

    // Initialize WebSocket with authentication
    function initializeWebSocket() {
        const token = localStorage.getItem('chatToken');
        ws = new WebSocket(`ws://localhost:8010/ws/call/${userId}?token=${token}`);
        
        ws.onmessage = async function(event) {
            const data = JSON.parse(event.data);
            
            switch(data.type) {
                case 'text':
                case 'transcript':
                    playTypingSound();
                    await simulateTyping(data.content, data.sender, data.name);
                    playMessageSound();
                    break;
                    
                case 'audio':
                    if (data.enabled) {
                        playAudioResponse(data.content);
                    }
                    break;
                    
                case 'video':
                    updateRemoteVideo(data.frame);
                    break;
            }
        };
    }

    // Typing animation and sound effects
    function playTypingSound() {
        typingSound.currentTime = 0;
        typingSound.play();
    }

    function playMessageSound() {
        messageSound.currentTime = 0;
        messageSound.play();
    }

    async function simulateTyping(text, sender, name) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('message-name');
        nameSpan.textContent = name;
        messageDiv.appendChild(nameSpan);

        const contentSpan = document.createElement('span');
        messageDiv.appendChild(contentSpan);
        chatMessages.appendChild(messageDiv);

        for (let i = 0; i < text.length; i++) {
            contentSpan.textContent += text[i];
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Voice and video call handling
    async function startCall() {
        if (!await showGDPRModal()) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true, 
                video: true 
            });
            
            audioStream = stream;
            videoStream = stream;

            // Setup local video
            const localVideo = document.createElement('video');
            localVideo.autoplay = true;
            localVideo.muted = true;
            localVideo.srcObject = stream;
            videoContainer.appendChild(localVideo);

            // Initialize WebSocket
            initializeWebSocket();

            // Setup audio processing
            setupAudioProcessing(stream);

            // Setup video processing
            setupVideoProcessing(stream);

            isCallActive = true;
            startCall.style.display = 'none';
            endCall.style.display = 'flex';
            addSystemMessage('Call started. You can speak now...');

        } catch (error) {
            console.error('Media access error:', error);
            addSystemMessage('Could not access camera or microphone. Please check permissions.');
        }
    }

    function endCall() {
        if (ws) ws.close();
        if (audioStream) audioStream.getTracks().forEach(track => track.stop());
        if (videoStream) videoStream.getTracks().forEach(track => track.stop());
        
        videoContainer.innerHTML = '';
        isCallActive = false;
        startCall.style.display = 'flex';
        endCall.style.display = 'none';
        addSystemMessage('Call ended.');
    }

    // Event Listeners
    chatButton.addEventListener('click', () => {
        chatContainer.style.display = 'flex';
        chatButton.style.display = 'none';
    });

    closeChat.addEventListener('click', () => {
        if (isCallActive) endCall();
        chatContainer.style.display = 'none';
        chatButton.style.display = 'flex';
    });

    startCall.addEventListener('click', startCall);
    endCall.addEventListener('click', endCall);

    // Session management
    async function loadUserSessions() {
        try {
            const response = await fetch(`/api/sessions/${userId}`);
            const sessions = await response.json();
            // Update UI with sessions
            updateSessionsList(sessions);
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    }

    function updateSessionsList(sessions) {
        const sessionsList = document.getElementById('sessionsList');
        sessionsList.innerHTML = sessions.map(session => `
            <div class="session-item">
                <div class="session-info">
                    <span>${new Date(session.start_time).toLocaleString()}</span>
                    <div class="session-actions">
                        <button onclick="downloadSession('${session.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="deleteSession('${session.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Initialize the chat interface
    async function initializeChat() {
        if (!localStorage.getItem('chatToken')) {
            await showGDPRModal();
        }
        loadUserSessions();
    }

    initializeChat();
}); 