// Chat Assistant Component
// Floating chat bubble with Claude API integration

class ChatAssistant {
    constructor(options = {}) {
        this.systemPrompt = options.systemPrompt || 'You are a helpful assistant.';
        this.pageContext = options.pageContext || 'general';
        this.messages = [];
        this.isOpen = false;
        this.isLoading = false;

        this.init();
    }

    init() {
        this.injectStyles();
        this.createUI();
        this.attachEventListeners();
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
                <button class="chat-close" title="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
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
        `;

        document.body.appendChild(this.bubble);
        document.body.appendChild(this.panel);

        // Cache DOM elements
        this.messagesContainer = this.panel.querySelector('#chatMessages');
        this.input = this.panel.querySelector('#chatInput');
        this.sendButton = this.panel.querySelector('#chatSend');
        this.closeButton = this.panel.querySelector('.chat-close');
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
                this.close();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.bubble.classList.add('hidden');
        this.panel.classList.add('open');
        setTimeout(() => this.input.focus(), 200);
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
        // Check for API key
        if (typeof CLAUDE_CONFIG === 'undefined' || !CLAUDE_CONFIG.apiKey || CLAUDE_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
            throw new Error('API_KEY_NOT_SET');
        }

        // Build messages array with conversation history
        const apiMessages = this.messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
        }));

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_CONFIG.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: CLAUDE_CONFIG.model || 'claude-sonnet-4-20250514',
                max_tokens: CLAUDE_CONFIG.maxTokens || 1024,
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
            return 'API key not configured. Add your key to js/config.js';
        }
        if (error.message.includes('401')) {
            return 'Invalid API key. Check your config.js file.';
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
