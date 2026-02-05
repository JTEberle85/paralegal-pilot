// Chat Assistant Component
// Floating chat bubble with Claude API integration

class ChatAssistant {
    constructor(options = {}) {
        this.systemPrompt = options.systemPrompt || 'You are a helpful assistant.';
        this.pageContext = options.pageContext || 'general';
        this.messages = [];
        this.isOpen = false;
        this.isLoading = false;
        this.storageKey = 'claude_api_key';

        this.init();
    }

    init() {
        this.injectStyles();
        this.createUI();
        this.attachEventListeners();

        // Check for API key on first open
        this.apiKey = this.getStoredApiKey();
    }

    getStoredApiKey() {
        return localStorage.getItem(this.storageKey) || '';
    }

    saveApiKey(key) {
        localStorage.setItem(this.storageKey, key);
        this.apiKey = key;
    }

    clearApiKey() {
        localStorage.removeItem(this.storageKey);
        this.apiKey = '';
    }

    injectStyles() {
        if (document.getElementById('chat-assistant-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'chat-assistant-styles';
        styles.textContent = `
            .chat-bubble {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 56px;
                height: 56px;
                background: var(--accent, #2563EB);
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                z-index: 9999;
            }
            .chat-bubble:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
            }
            .chat-bubble svg {
                width: 24px;
                height: 24px;
                fill: white;
            }
            .chat-bubble.hidden {
                display: none;
            }

            .chat-panel {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 400px;
                height: 520px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                z-index: 9999;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            .chat-panel.open {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            .chat-header {
                padding: 16px;
                background: var(--accent, #2563EB);
                color: white;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .chat-header h3 {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
            }
            .chat-header-subtitle {
                font-size: 11px;
                opacity: 0.85;
                margin-top: 2px;
            }
            .chat-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: background 0.15s ease;
            }
            .chat-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            .chat-close svg {
                width: 20px;
                height: 20px;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .chat-message {
                max-width: 85%;
                padding: 10px 14px;
                border-radius: 12px;
                font-size: 13px;
                line-height: 1.5;
            }
            .chat-message.user {
                background: var(--accent, #2563EB);
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }
            .chat-message.assistant {
                background: #F3F4F6;
                color: #1F2937;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }
            .chat-message.error {
                background: #FEF2F2;
                color: #B91C1C;
                align-self: center;
                text-align: center;
                font-size: 12px;
            }
            .chat-message.welcome {
                background: #F0F7FF;
                color: #1E40AF;
                align-self: center;
                text-align: center;
                font-size: 12px;
                border: 1px solid #BFDBFE;
            }

            .chat-typing {
                display: flex;
                gap: 4px;
                padding: 10px 14px;
                background: #F3F4F6;
                border-radius: 12px;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }
            .chat-typing span {
                width: 8px;
                height: 8px;
                background: #9CA3AF;
                border-radius: 50%;
                animation: typing 1.4s infinite ease-in-out;
            }
            .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
            .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-4px); }
            }

            .chat-input-area {
                padding: 12px 16px;
                border-top: 1px solid #E5E7EB;
                display: flex;
                gap: 8px;
            }
            .chat-input {
                flex: 1;
                padding: 10px 14px;
                border: 1px solid #E5E7EB;
                border-radius: 8px;
                font-size: 13px;
                outline: none;
                transition: border-color 0.15s ease;
                font-family: inherit;
                resize: none;
                min-height: 40px;
                max-height: 80px;
            }
            .chat-input:focus {
                border-color: var(--accent, #2563EB);
            }
            .chat-input::placeholder {
                color: #9CA3AF;
            }
            .chat-send {
                padding: 10px 16px;
                background: var(--accent, #2563EB);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.15s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .chat-send:hover {
                background: #1D4ED8;
            }
            .chat-send:disabled {
                background: #9CA3AF;
                cursor: not-allowed;
            }
            .chat-send svg {
                width: 18px;
                height: 18px;
            }

            .chat-footer {
                padding: 8px 16px;
                text-align: center;
                font-size: 10px;
                color: #9CA3AF;
                border-top: 1px solid #E5E7EB;
            }
            .chat-footer a {
                color: #6B7280;
                text-decoration: none;
            }
            .chat-footer a:hover {
                text-decoration: underline;
            }

            @media (max-width: 480px) {
                .chat-panel {
                    width: calc(100% - 32px);
                    height: calc(100% - 100px);
                    bottom: 16px;
                    right: 16px;
                }
                .chat-bubble {
                    bottom: 16px;
                    right: 16px;
                }
            }

            /* Settings button and modal */
            .chat-settings-btn {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: background 0.15s ease;
                margin-right: 8px;
            }
            .chat-settings-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            .chat-settings-btn svg {
                width: 18px;
                height: 18px;
            }
            .chat-header-actions {
                display: flex;
                align-items: center;
            }

            .chat-settings-modal {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
                border-radius: 12px;
            }
            .chat-settings-modal.open {
                opacity: 1;
                pointer-events: auto;
            }
            .chat-settings-content {
                background: white;
                padding: 24px;
                border-radius: 12px;
                width: 90%;
                max-width: 320px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            }
            .chat-settings-content h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
                color: #1F2937;
            }
            .chat-settings-content p {
                margin: 0 0 16px 0;
                font-size: 12px;
                color: #6B7280;
                line-height: 1.4;
            }
            .chat-settings-content label {
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 6px;
            }
            .chat-settings-content input {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #E5E7EB;
                border-radius: 6px;
                font-size: 13px;
                font-family: monospace;
                box-sizing: border-box;
            }
            .chat-settings-content input:focus {
                outline: none;
                border-color: var(--accent, #2563EB);
            }
            .chat-settings-actions {
                display: flex;
                gap: 8px;
                margin-top: 16px;
            }
            .chat-settings-actions button {
                flex: 1;
                padding: 10px 16px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.15s ease;
            }
            .chat-settings-save {
                background: var(--accent, #2563EB);
                color: white;
                border: none;
            }
            .chat-settings-save:hover {
                background: #1D4ED8;
            }
            .chat-settings-cancel {
                background: white;
                color: #374151;
                border: 1px solid #E5E7EB;
            }
            .chat-settings-cancel:hover {
                background: #F9FAFB;
            }
        `;
        document.head.appendChild(styles);
    }

    createUI() {
        // Chat bubble
        this.bubble = document.createElement('div');
        this.bubble.className = 'chat-bubble';
        this.bubble.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
        `;
        this.bubble.title = 'Chat with AI Assistant';

        // Chat panel
        this.panel = document.createElement('div');
        this.panel.className = 'chat-panel';
        this.panel.innerHTML = `
            <div class="chat-header">
                <div>
                    <h3>AI Assistant</h3>
                    <div class="chat-header-subtitle">${this.getContextLabel()}</div>
                </div>
                <div class="chat-header-actions">
                    <button class="chat-settings-btn" title="Settings">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 1v4m0 14v4m-9-9h4m14 0h4m-3.5-6.5l-2.8 2.8m-9.4 9.4l-2.8 2.8m0-15l2.8 2.8m9.4 9.4l2.8 2.8"/>
                        </svg>
                    </button>
                    <button class="chat-close" title="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="chat-message welcome">
                    Hi! I'm here to help. Ask me anything about this page.
                </div>
            </div>
            <div class="chat-input-area">
                <textarea class="chat-input" id="chatInput" placeholder="Type a message..." rows="1"></textarea>
                <button class="chat-send" id="chatSend" title="Send">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                </button>
            </div>
            <div class="chat-footer">
                Powered by <a href="https://anthropic.com" target="_blank">Claude</a> · Demo only
            </div>
            <div class="chat-settings-modal" id="chatSettingsModal">
                <div class="chat-settings-content">
                    <h4>API Settings</h4>
                    <p>Enter your Claude API key. It will be saved in your browser's local storage.</p>
                    <label for="chatApiKeyInput">API Key</label>
                    <input type="password" id="chatApiKeyInput" placeholder="sk-ant-api03-..." />
                    <div class="chat-settings-actions">
                        <button class="chat-settings-cancel" id="chatSettingsCancel">Cancel</button>
                        <button class="chat-settings-save" id="chatSettingsSave">Save</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.bubble);
        document.body.appendChild(this.panel);

        // Cache DOM elements
        this.messagesContainer = this.panel.querySelector('#chatMessages');
        this.input = this.panel.querySelector('#chatInput');
        this.sendButton = this.panel.querySelector('#chatSend');
        this.closeButton = this.panel.querySelector('.chat-close');
        this.settingsButton = this.panel.querySelector('.chat-settings-btn');
        this.settingsModal = this.panel.querySelector('#chatSettingsModal');
        this.apiKeyInput = this.panel.querySelector('#chatApiKeyInput');
        this.settingsSaveBtn = this.panel.querySelector('#chatSettingsSave');
        this.settingsCancelBtn = this.panel.querySelector('#chatSettingsCancel');
    }

    getContextLabel() {
        const labels = {
            'intake': 'Immigration Intake Helper',
            'redline': 'Contract Review Helper',
            'checklist': 'Document Requirements Helper',
            'general': 'General Assistant'
        };
        return labels[this.pageContext] || labels.general;
    }

    attachEventListeners() {
        this.bubble.addEventListener('click', () => this.open());
        this.closeButton.addEventListener('click', () => this.close());
        this.sendButton.addEventListener('click', () => this.sendMessage());

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 80) + 'px';
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                if (this.settingsModal.classList.contains('open')) {
                    this.closeSettings();
                } else {
                    this.close();
                }
            }
        });

        // Settings modal events
        this.settingsButton.addEventListener('click', () => this.openSettings());
        this.settingsCancelBtn.addEventListener('click', () => this.closeSettings());
        this.settingsSaveBtn.addEventListener('click', () => this.saveSettings());

        // Close settings on backdrop click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Save on Enter in API key input
        this.apiKeyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveSettings();
            }
        });
    }

    openSettings() {
        this.apiKeyInput.value = this.apiKey;
        this.settingsModal.classList.add('open');
        setTimeout(() => this.apiKeyInput.focus(), 100);
    }

    closeSettings() {
        this.settingsModal.classList.remove('open');
    }

    saveSettings() {
        const key = this.apiKeyInput.value.trim();
        if (key) {
            this.saveApiKey(key);
            this.addMessage('API key saved successfully.', 'welcome');
        } else {
            this.clearApiKey();
            this.addMessage('API key cleared.', 'welcome');
        }
        this.closeSettings();
    }

    open() {
        this.isOpen = true;
        this.bubble.classList.add('hidden');
        this.panel.classList.add('open');

        // Show settings modal if no API key is set
        if (!this.apiKey) {
            setTimeout(() => this.openSettings(), 200);
        } else {
            setTimeout(() => this.input.focus(), 200);
        }
    }

    close() {
        this.isOpen = false;
        this.panel.classList.remove('open');
        this.bubble.classList.remove('hidden');
    }

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text || this.isLoading) return;

        // Add user message
        this.addMessage(text, 'user');
        this.input.value = '';
        this.input.style.height = 'auto';

        // Show typing indicator
        this.isLoading = true;
        this.sendButton.disabled = true;
        const typingEl = this.showTyping();

        try {
            const response = await this.callClaudeAPI(text);
            this.removeTyping(typingEl);
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.removeTyping(typingEl);
            this.addMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
            this.sendButton.disabled = false;
        }
    }

    addMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `chat-message ${type}`;
        msg.textContent = text;
        this.messagesContainer.appendChild(msg);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

        // Store in history for API context
        if (type === 'user' || type === 'assistant') {
            this.messages.push({ role: type, content: text });
        }
    }

    showTyping() {
        const typing = document.createElement('div');
        typing.className = 'chat-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        this.messagesContainer.appendChild(typing);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        return typing;
    }

    removeTyping(el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    async callClaudeAPI(userMessage) {
        // Check for API key (prioritize localStorage over config)
        const apiKey = this.apiKey || (typeof CLAUDE_CONFIG !== 'undefined' ? CLAUDE_CONFIG.apiKey : '');
        if (!apiKey) {
            throw new Error('API_KEY_NOT_SET');
        }

        // Build messages array with conversation history
        const apiMessages = this.messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
        }));

        const config = typeof CLAUDE_CONFIG !== 'undefined' ? CLAUDE_CONFIG : {};
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: config.model || 'claude-sonnet-4-20250514',
                max_tokens: config.maxTokens || 1024,
                system: this.systemPrompt,
                messages: apiMessages
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    getErrorMessage(error) {
        if (error.message === 'API_KEY_NOT_SET') {
            return 'API key not configured. Click the gear icon to add your key.';
        }
        if (error.message.includes('401')) {
            return 'Invalid API key. Click the gear icon to update it.';
        }
        if (error.message.includes('429')) {
            return 'Rate limited. Please wait a moment and try again.';
        }
        if (error.message.includes('Failed to fetch')) {
            return 'Network error. Check your connection.';
        }
        return `Error: ${error.message}`;
    }
}

// Auto-initialize if data attribute is present
document.addEventListener('DOMContentLoaded', () => {
    const chatConfig = document.querySelector('[data-chat-assistant]');
    if (chatConfig) {
        window.chatAssistant = new ChatAssistant({
            systemPrompt: chatConfig.dataset.systemPrompt,
            pageContext: chatConfig.dataset.pageContext
        });
    }
});
