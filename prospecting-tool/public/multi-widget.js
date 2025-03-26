(function () {
    function getWidgetId() {
        try {
            if (window.ADEALO_WIDGET_ID) return window.ADEALO_WIDGET_ID;
            const configWidgetId = window.widgetConfig && window.widgetConfig.id ? window.widgetConfig.id : null;
            if (configWidgetId) return configWidgetId;
            const dataWidgetId = document.currentScript ? document.currentScript.getAttribute('data-widget-id') : null;
            if (dataWidgetId) return dataWidgetId;
            const getScriptUrlParameter = function (name) {
                if (!document.currentScript || !document.currentScript.src) return '';
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                var results = regex.exec(document.currentScript.src);
                return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            };
            const scriptUrlWidgetId = getScriptUrlParameter('widgetId');
            if (scriptUrlWidgetId) return scriptUrlWidgetId;
            const getUrlParameter = function (name) {
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                var results = regex.exec(location.search);
                return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            };
            const urlWidgetId = getUrlParameter('widgetId');
            if (urlWidgetId) return urlWidgetId;
            const scripts = document.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                const scriptDataWidgetId = scripts[i].getAttribute('data-widget-id');
                if (scriptDataWidgetId) return scriptDataWidgetId;
            }
            return 'WnwIUWLRHxM09A6EYJPY'; // Default for testing
        } catch (error) {
            console.error('Error in getWidgetId:', error);
            return null;
        }
    }

    const widgetId = getWidgetId();
    if (!widgetId) {
        console.error('Widget Error: Missing widgetId parameter');
        return;
    }

    let container = document.getElementById('adealo-widget-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'adealo-widget-container';
        document.body.appendChild(container);
    }

    async function fetchWidgetConfig() {
        try {
            const API_URL = 'https://us-central1-adealo-ce238.cloudfunctions.net';
            const response = await fetch(`${API_URL}/getWidgetConfigHttp?widgetId=${widgetId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching widget configuration:', error);
            return null;
        }
    }

    let lastInteraction = 0;
    function trackInteraction(eventType, data = {}) {
        try {
            const now = Date.now();
            if (now - lastInteraction < 500) return;
            lastInteraction = now;
            const API_URL = 'https://us-central1-adealo-ce238.cloudfunctions.net';
            fetch(`${API_URL}/trackWidgetInteractionHttp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    widgetId,
                    eventType,
                    data,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    referrer: document.referrer,
                    userAgent: navigator.userAgent
                })
            }).catch(error => console.error('Error tracking interaction:', error));
        } catch (error) {
            console.error('Error tracking widget interaction:', error);
        }
    }

    async function initWidget() {
        let config = window.widgetConfig || {};
        if (!config.design) {
            config = await fetchWidgetConfig();
            if (!config) {
                console.error('Widget Error: Failed to fetch widget configuration');
                config = {
                    design: {
                        position: 'bottom-right',
                        colors: {
                            primary: '#1A73E8',
                            background: '#FFFFFF',
                            textPrimary: '#1F2A44',
                            textSecondary: '#6B7280'
                        },
                        launcher: { size: 60, shape: 'circle' },
                        font: 'Inter, sans-serif'
                    },
                    content: {
                        greeting: 'Hello!',
                        tagline: 'We’re here to help you succeed!',
                        logo: 'https://via.placeholder.com/40'
                    },
                    features: {
                        chat: {
                            agentName: 'Support Team',
                            greeting: 'Hi there! 👋 How can I assist you today?',
                            quickReplies: [
                                { text: 'Contact Support', value: 'support' },
                                { text: 'Book a Demo', value: 'demo' },
                                { text: 'Call Me Up', value: 'call' }
                            ],
                            supportOptions: [
                                { text: 'Billing', value: 'billing' },
                                { text: 'Technical', value: 'technical' },
                                { text: 'Other', value: 'other' }
                            ],
                            demoOptions: [
                                { text: 'Product Overview', value: 'overview' },
                                { text: 'Specific Feature', value: 'feature' },
                                { text: 'Pricing', value: 'pricing' }
                            ],
                            callOptions: [
                                { text: 'Finance', value: 'finance' },
                                { text: 'Support', value: 'support' },
                                { text: 'Sales', value: 'sales' }
                            ]
                        }
                    },
                    saasBranding: {
                        name: 'YourSaaSName',
                        url: 'https://yoursaas.com'
                    }
                };
            }
        }

        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            :root {
                --primary: ${config.design.colors.primary || '#1A73E8'};
                --primary-dark: ${config.design.colors.primaryDark || '#1557B0'};
                --background: ${config.design.colors.background || '#FFFFFF'};
                --text-primary: ${config.design.colors.textPrimary || '#1F2A44'};
                --text-secondary: ${config.design.colors.textSecondary || '#6B7280'};
                --border: ${config.design.colors.border || '#E5E7EB'};
                --success: ${config.design.colors.success || '#34C759'};
                --spacing-xs: 4px;
                --spacing-sm: 8px;
                --spacing-md: 16px;
                --spacing-lg: 24px;
                --spacing-xl: 32px;
                --radius-sm: 8px;
                --radius-md: 12px;
                --radius-lg: 16px;
                --shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.1);
                --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
                --font-family: ${config.design.font || 'Inter, sans-serif'};
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideInRight {
                from { transform: translateX(20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutLeft {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-20px); opacity: 0; }
            }
            @keyframes slideInLeft {
                from { transform: translateX(-20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(20px); opacity: 0; }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes messageFadeIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes iconFadeScale {
                0% { opacity: 1; transform: scale(1) rotate(0deg); }
                50% { opacity: 0; transform: scale(0.6) rotate(90deg); }
                100% { opacity: 1; transform: scale(1) rotate(0deg); }
            }
            @keyframes scaleIn {
                0% { transform: scale(0.5) translateY(20px); opacity: 0; }
                80% { transform: scale(1.02) translateY(0); opacity: 1; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes scaleOut {
                from { transform: scale(1) translateY(0); opacity: 1; }
                to { transform: scale(0.5) translateY(20px); opacity: 0; }
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(var(--primary-rgb), 0); }
                100% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0); }
            }
            @keyframes bubbleFadeIn {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes checkmark {
                0% { stroke-dashoffset: 50; }
                100% { stroke-dashoffset: 0; }
            }
            .fade-in { animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .slide-out-left { animation: slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .slide-in-left { animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .slide-out-right { animation: slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .message-fade-in { animation: messageFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .icon-transition { animation: iconFadeScale 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .scale-in { animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .scale-out { animation: scaleOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .pulse { animation: pulse 2s infinite; }
            .bubble-fade-in-1 { animation: bubbleFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .bubble-fade-in-2 { animation: bubbleFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards; }
            .bubble-fade-in-3 { animation: bubbleFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards; }
            .checkmark {
                stroke: var(--success);
                stroke-width: 3;
                stroke-linecap: round;
                stroke-dasharray: 50;
                stroke-dashoffset: 50;
                animation: checkmark 0.5s ease forwards;
            }
            .typing-indicator {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 24px;
                background: none;
            }
            .typing-indicator::after {
                content: '';
                width: 20px;
                height: 20px;
                border: 2px solid var(--primary);
                border-top: 2px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            .adealo-widget {
                font-family: var(--font-family);
                line-height: 1.6;
                display: flex;
                flex-direction: column;
                width: 380px;
                max-width: 90vw;
                height: 600px;
                direction: ltr;
                transform-origin: bottom right;
                opacity: 0;
                transition: opacity 0.3s ease;
                border-radius: var(--radius-lg);
                background-color: var(--background);
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
            }
            .adealo-widget.visible {
                opacity: 1;
            }
            .adealo-widget * {
                box-sizing: border-box;
            }
            .adealo-widget button:focus,
            .adealo-widget input:focus {
                outline: 2px solid var(--primary-dark);
                outline-offset: 2px;
            }
            .floating-bubbles {
                position: absolute;
                bottom: 80px;
                right: 0;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
                align-items: flex-end;
            }
            .floating-bubble {
                background: var(--primary);
                color: #FFFFFF;
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-md) var(--radius-md) 0 var(--radius-md);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                box-shadow: var(--shadow-sm);
                opacity: 0;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .floating-bubble:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            .emoji-menu {
                position: absolute;
                bottom: 60px;
                right: 20px;
                background: var(--background);
                border: 1px solid var(--border);
                border-radius: var(--radius-sm);
                padding: var(--spacing-sm);
                box-shadow: var(--shadow-sm);
                display: none;
                z-index: 1001;
            }
            .emoji-menu span {
                font-size: 20px;
                margin: var(--spacing-xs);
                cursor: pointer;
            }
            .emoji-menu span:hover {
                background: #F0F0F0;
                border-radius: var(--radius-sm);
            }
            .message-bubble-user {
                background: var(--primary) !important;
                color: #fff !important;
                border-radius: var(--radius-md) var(--radius-sm) var(--radius-md) var(--radius-md) !important;
                margin-left: auto;
                box-shadow: var(--shadow-sm);
                word-wrap: break-word;
            }
            .message-bubble-bot {
                background: #F1F3F4 !important;
                color: var(--text-primary) !important;
                border-radius: var(--radius-sm) var(--radius-md) var(--radius-md) var(--radius-md) !important;
                box-shadow: var(--shadow-sm);
                word-wrap: break-word;
            }
            .message-timestamp {
                font-size: 12px;
                color: var(--text-secondary);
                margin-top: var(--spacing-xs);
                text-align: right;
            }
            .message-bubble-bot .message-timestamp {
                text-align: left;
            }
            .chat-input-container {
                display: flex;
                align-items: center;
                background-color: var(--background);
                border-radius: 30px;
                padding: var(--spacing-sm) var(--spacing-md);
                margin: var(--spacing-md);
                border: 1px solid var(--border);
                box-shadow: var(--shadow-sm);
                width: calc(100% - 32px);
                transition: box-shadow 0.2s ease, border-color 0.2s ease;
            }
            .chat-input-container:has(.chat-input:focus) {
                border: 1px solid var(--primary);
                box-shadow: none;
            }
            .chat-input {
                flex: 1;
                border: none;
                outline: none;
                font-size: 14px;
                padding: var(--spacing-sm) 0;
                color: var(--text-primary);
            }
            .chat-input::placeholder {
                color: var(--text-secondary);
                opacity: 0.7;
            }
            .chat-input:focus {
                outline: none !important;
            }
            .chat-send-button {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--primary);
                color: white;
                border: none;
                cursor: pointer;
                margin-left: var(--spacing-sm);
                opacity: 0.5;
                transition: opacity 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
            }
            .chat-send-button.active {
                opacity: 1;
            }
            .chat-send-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .chat-send-button:active {
                transform: translateY(0);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            .chat-emoji-button {
                background: none;
                border: none;
                cursor: pointer;
                color: var(--text-secondary);
                padding: 0;
                margin-right: var(--spacing-sm);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .launcher-icon-container {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
            }
            .quick-reply-button {
                background: var(--primary);
                border: none;
                border-radius: var(--radius-md);
                padding: var(--spacing-sm) var(--spacing-md);
                margin: var(--spacing-xs);
                cursor: pointer;
                font-size: 14px;
                color: #FFFFFF;
                transition: background-color 0.2s ease, transform 0.2s ease;
            }
            .quick-reply-button:hover {
                background: var(--primary-dark);
                transform: translateY(-1px);
            }
            .back-button {
                background: none;
                border: none;
                color: var(--primary);
                font-size: 14px;
                cursor: pointer;
                margin: var(--spacing-xs);
            }
            .powered-by {
                text-align: center;
                padding: var(--spacing-sm);
                font-size: 12px;
                color: var(--text-secondary);
                background: #F5F5F5;
                border-top: 1px solid var(--border);
            }
            .powered-by a {
                color: var(--primary);
                text-decoration: none;
            }
            .powered-by a:hover {
                text-decoration: underline;
            }
            .calendly-iframe {
                width: 100%;
                height: 400px;
                border: none;
                border-radius: var(--radius-md);
                margin-top: var(--spacing-md);
            }
            .success-icon {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: var(--success);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto var(--spacing-lg);
            }
        `;
        document.head.appendChild(style);

        const primaryColor = config.design.colors.primary || '#1A73E8';
        const rgb = primaryColor.match(/\w\w/g).map(hex => parseInt(hex, 16));
        document.documentElement.style.setProperty('--primary-rgb', rgb.join(','));

        container.style.position = 'fixed';
        container.style.zIndex = '9999';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.left = 'auto';
        container.style.top = 'auto';
        container.style.transformOrigin = 'bottom right';
        container.style.direction = 'ltr';

        const button = document.createElement('button');
        button.id = 'adealo-widget-button-' + widgetId;
        button.setAttribute('aria-label', 'Open widget');
        const launcherSize = config.design?.launcher?.size || 60;
        button.style.width = launcherSize + 'px';
        button.style.height = launcherSize + 'px';
        button.style.borderRadius = config.design?.launcher?.shape === 'rounded-square' ? '12px' : '50%';
        button.style.backgroundColor = 'var(--primary)';
        button.style.color = '#FFFFFF';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease';
        button.style.boxShadow = 'var(--shadow-md)';
        button.classList.add('pulse');

        const chatIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.916.455-5.922.505a.39.39 0 0 0-.266.112L8.78 21.53A.75.75 0 0 1 7.5 21v-3.955a48.842 48.842 0 0 1-2.652-.316c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clip-rule="evenodd" /></svg>`;
        const arrowDownSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" /></svg>`;

        const iconContainer = document.createElement('div');
        iconContainer.classList.add('launcher-icon-container');
        iconContainer.innerHTML = chatIconSVG;
        button.appendChild(iconContainer);

        const floatingBubbles = document.createElement('div');
        floatingBubbles.classList.add('floating-bubbles');
        const bubbleCTAs = [
            { text: 'Contact Support', value: 'support' },
            { text: 'Book a Demo', value: 'demo' },
            { text: 'Call Me Up', value: 'call' }
        ];

        bubbleCTAs.forEach((cta, index) => {
            const bubble = document.createElement('div');
            bubble.classList.add('floating-bubble', `bubble-fade-in-${index + 1}`);
            bubble.textContent = cta.text;
            bubble.setAttribute('aria-label', cta.text);
            bubble.setAttribute('role', 'button');
            bubble.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleWidget();
                setTimeout(() => {
                    sendInitialMessage(cta.value);
                }, 500);
            });
            floatingBubbles.appendChild(bubble);
        });

        const content = document.createElement('div');
        content.id = 'adealo-widget-content-' + widgetId;
        content.setAttribute('role', 'dialog');
        content.setAttribute('aria-label', 'Support Widget');
        content.classList.add('adealo-widget');
        content.style.display = 'none';
        content.style.position = 'absolute';
        content.style.bottom = 'calc(100% + 20px)';
        content.style.right = '0';
        content.style.left = 'auto';
        content.style.direction = 'ltr';

        const contentArea = document.createElement('div');
        contentArea.style.flex = '1';
        contentArea.style.overflowY = 'auto';
        contentArea.style.backgroundColor = 'var(--background)';
        contentArea.style.display = 'flex';
        contentArea.style.flexDirection = 'column';

        const footer = document.createElement('div');
        footer.classList.add('powered-by');
        footer.innerHTML = `Powered by <a href="${config.saasBranding?.url || 'https://yoursaas.com'}" target="_blank">${config.saasBranding?.name || 'YourSaaSName'}</a>`;

        content.appendChild(contentArea);
        content.appendChild(footer);
        container.appendChild(button);
        container.appendChild(floatingBubbles);
        container.appendChild(content);

        let chatState = { currentFlow: null, step: 0 };
        let messagesContainer, inputArea, chatInput, quickRepliesContainer;

        function showChatScreen() {
            const chatContainer = document.createElement('div');
            chatContainer.style.height = '100%';
            chatContainer.style.display = 'flex';
            chatContainer.style.flexDirection = 'column';

            messagesContainer = document.createElement('div');
            messagesContainer.classList.add('messages-container');
            messagesContainer.style.flex = '1';
            messagesContainer.style.padding = 'var(--spacing-lg)';
            messagesContainer.style.overflowY = 'auto';

            const welcomeMessage = document.createElement('div');
            welcomeMessage.style.display = 'none';
            welcomeMessage.style.marginBottom = 'var(--spacing-md)';

            const welcomeAvatar = document.createElement('div');
            welcomeAvatar.style.width = '32px';
            welcomeAvatar.style.height = '32px';
            welcomeAvatar.style.borderRadius = '50%';
            welcomeAvatar.style.backgroundColor = 'var(--primary)';
            welcomeAvatar.style.color = '#FFFFFF';
            welcomeAvatar.style.display = 'flex';
            welcomeAvatar.style.alignItems = 'center';
            welcomeAvatar.style.justifyContent = 'center';
            welcomeAvatar.style.marginRight = 'var(--spacing-sm)';
            welcomeAvatar.style.flexShrink = '0';
            welcomeAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

            const messageContent = document.createElement('div');
            messageContent.style.maxWidth = '80%';

            const messageName = document.createElement('div');
            messageName.style.fontWeight = '600';
            messageName.style.fontSize = '13px';
            messageName.style.marginBottom = 'var(--spacing-xs)';
            messageName.style.color = 'var(--text-secondary)';
            messageName.textContent = config.features?.chat?.agentName || 'Support Team';

            const messageText = document.createElement('div');
            messageText.classList.add('message-bubble-bot');
            messageText.style.padding = 'var(--spacing-sm) var(--spacing-md)';
            messageText.style.fontSize = '14px';
            messageText.style.lineHeight = '1.5';
            messageText.textContent = config.features?.chat?.greeting || 'Hi there! 👋 How can I assist you today?';

            const messageTimestamp = document.createElement('div');
            messageTimestamp.classList.add('message-timestamp');
            messageTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messageContent.appendChild(messageName);
            messageContent.appendChild(messageText);
            messageContent.appendChild(messageTimestamp);
            welcomeMessage.appendChild(welcomeAvatar);
            welcomeMessage.appendChild(messageContent);

            const typingIndicator = document.createElement('div');
            typingIndicator.style.display = 'flex';
            typingIndicator.style.marginBottom = 'var(--spacing-md)';

            const typingAvatar = welcomeAvatar.cloneNode(true);
            const typingBubble = document.createElement('div');
            typingBubble.classList.add('typing-indicator');

            typingIndicator.appendChild(typingAvatar);
            typingIndicator.appendChild(typingBubble);
            messagesContainer.appendChild(typingIndicator);
            messagesContainer.appendChild(welcomeMessage);

            quickRepliesContainer = document.createElement('div');
            quickRepliesContainer.style.display = 'none';
            quickRepliesContainer.style.marginBottom = 'var(--spacing-md)';
            quickRepliesContainer.style.display = 'flex';
            quickRepliesContainer.style.flexWrap = 'wrap';
            quickRepliesContainer.style.gap = 'var(--spacing-sm)';

            if (config.features?.chat?.quickReplies) {
                config.features.chat.quickReplies.forEach(reply => {
                    const quickReplyButton = document.createElement('button');
                    quickReplyButton.classList.add('quick-reply-button');
                    quickReplyButton.textContent = reply.text;
                    quickReplyButton.addEventListener('click', () => {
                        sendInitialMessage(reply.value);
                    });
                    quickRepliesContainer.appendChild(quickReplyButton);
                });
            }

            messagesContainer.appendChild(quickRepliesContainer);

            setTimeout(() => {
                typingIndicator.style.display = 'none';
                welcomeMessage.style.display = 'flex';
                welcomeMessage.classList.add('message-fade-in');
                quickRepliesContainer.style.display = 'flex';
                quickRepliesContainer.classList.add('message-fade-in');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 2000);

            // Create input area only once
            if (!inputArea) {
                inputArea = document.createElement('div');
                inputArea.classList.add('chat-input-container');

                const emojiButton = document.createElement('button');
                emojiButton.classList.add('chat-emoji-button');
                emojiButton.setAttribute('aria-label', 'Add emoji');
                emojiButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>';

                const emojiMenu = document.createElement('div');
                emojiMenu.classList.add('emoji-menu');
                emojiMenu.innerHTML = `
                    <span>😊</span><span>👍</span><span>😂</span><span>❤️</span><span>😢</span><span>😡</span>
                `;
                inputArea.appendChild(emojiMenu);

                emojiButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    emojiMenu.style.display = emojiMenu.style.display === 'block' ? 'none' : 'block';
                });

                emojiMenu.querySelectorAll('span').forEach(span => {
                    span.addEventListener('click', (e) => {
                        e.stopPropagation();
                        chatInput.value += span.textContent;
                        emojiMenu.style.display = 'none';
                        chatInput.dispatchEvent(new Event('input'));
                    });
                });

                chatInput = document.createElement('input');
                chatInput.type = 'text';
                chatInput.classList.add('chat-input');
                chatInput.placeholder = config.chatConfig?.inputPlaceholder || 'Type your message...';
                chatInput.setAttribute('aria-label', 'Type your message');

                const sendButton = document.createElement('button');
                sendButton.classList.add('chat-send-button');
                sendButton.setAttribute('aria-label', 'Send message');
                sendButton.style.display = 'flex';
                sendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

                chatInput.addEventListener('input', () => {
                    if (chatInput.value.trim()) {
                        sendButton.classList.add('active');
                    } else {
                        sendButton.classList.remove('active');
                    }
                });

                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.stopPropagation();
                        sendMessage();
                    }
                });

                sendButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sendMessage();
                });

                inputArea.appendChild(emojiButton);
                inputArea.appendChild(chatInput);
                inputArea.appendChild(sendButton);
            }

            chatContainer.appendChild(messagesContainer);
            chatContainer.appendChild(inputArea);
            contentArea.appendChild(chatContainer);
        }

        function sendInitialMessage(flow) {
            chatState.currentFlow = flow;
            chatState.step = 0;

            const userMessageElement = document.createElement('div');
            userMessageElement.style.display = 'flex';
            userMessageElement.style.flexDirection = 'row-reverse';
            userMessageElement.style.marginBottom = 'var(--spacing-md)';

            const userMessageContent = document.createElement('div');
            userMessageContent.classList.add('message-bubble-user');
            userMessageContent.style.padding = 'var(--spacing-sm) var(--spacing-md)';
            userMessageContent.style.maxWidth = '80%';
            userMessageContent.textContent = flow === 'support' ? 'I need support.' : flow === 'demo' ? 'I’d like to book a demo.' : 'I’d like to request a call.';

            const userMessageTimestamp = document.createElement('div');
            userMessageTimestamp.classList.add('message-timestamp');
            userMessageTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            userMessageContent.appendChild(userMessageTimestamp);
            userMessageElement.appendChild(userMessageContent);
            messagesContainer.appendChild(userMessageElement);
            userMessageElement.classList.add('message-fade-in');

            quickRepliesContainer.style.display = 'none';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            trackInteraction('chat_flow_started', { flow });

            setTimeout(() => {
                showBotResponse(flow);
            }, 1000);
        }

        function showBotResponse(flow) {
            const responseTypingIndicator = document.createElement('div');
            responseTypingIndicator.style.display = 'flex';
            responseTypingIndicator.style.marginBottom = 'var(--spacing-md)';

            const responseTypingAvatar = document.createElement('div');
            responseTypingAvatar.style.width = '32px';
            responseTypingAvatar.style.height = '32px';
            responseTypingAvatar.style.borderRadius = '50%';
            responseTypingAvatar.style.backgroundColor = 'var(--primary)';
            responseTypingAvatar.style.color = '#FFFFFF';
            responseTypingAvatar.style.display = 'flex';
            responseTypingAvatar.style.alignItems = 'center';
            responseTypingAvatar.style.justifyContent = 'center';
            responseTypingAvatar.style.marginRight = 'var(--spacing-sm)';
            responseTypingAvatar.style.flexShrink = '0';
            responseTypingAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

            const responseTypingBubble = document.createElement('div');
            responseTypingBubble.classList.add('typing-indicator');

            responseTypingIndicator.appendChild(responseTypingAvatar);
            responseTypingIndicator.appendChild(responseTypingBubble);
            messagesContainer.appendChild(responseTypingIndicator);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            setTimeout(() => {
                responseTypingIndicator.style.display = 'none';

                const agentResponse = document.createElement('div');
                agentResponse.style.display = 'flex';
                agentResponse.style.marginBottom = 'var(--spacing-md)';

                const responseAvatar = responseTypingAvatar.cloneNode(true);
                const responseContent = document.createElement('div');
                responseContent.style.maxWidth = '80%';

                const responseName = document.createElement('div');
                responseName.style.fontWeight = '600';
                responseName.style.fontSize = '13px';
                responseName.style.marginBottom = 'var(--spacing-xs)';
                responseName.style.color = 'var(--text-secondary)';
                responseName.textContent = config.features?.chat?.agentName || 'Support Team';

                const responseText = document.createElement('div');
                responseText.classList.add('message-bubble-bot');
                responseText.style.padding = 'var(--spacing-sm) var(--spacing-md)';

                const responseTimestamp = document.createElement('div');
                responseTimestamp.classList.add('message-timestamp');
                responseTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                if (flow === 'support' && chatState.step === 0) {
                    responseText.textContent = 'I’m here to help! What’s your issue?';
                    chatState.step = 1;

                    const optionsContainer = document.createElement('div');
                    optionsContainer.style.display = 'flex';
                    optionsContainer.style.flexWrap = 'wrap';
                    optionsContainer.style.gap = 'var(--spacing-sm)';
                    optionsContainer.style.marginTop = 'var(--spacing-sm)';

                    config.features.chat.supportOptions.forEach(option => {
                        const optionButton = document.createElement('button');
                        optionButton.classList.add('quick-reply-button');
                        optionButton.textContent = option.text;
                        optionButton.addEventListener('click', () => {
                            handleSupportOption(option.value);
                        });
                        optionsContainer.appendChild(optionButton);
                    });

                    const backButton = document.createElement('button');
                    backButton.classList.add('back-button');
                    backButton.textContent = 'Back';
                    backButton.addEventListener('click', () => {
                        chatState.currentFlow = null;
                        chatState.step = 0;
                        quickRepliesContainer.style.display = 'flex';
                        optionsContainer.remove();
                        backButton.remove();
                    });
                    optionsContainer.appendChild(backButton);

                    responseText.appendChild(optionsContainer);
                } else if (flow === 'demo' && chatState.step === 0) {
                    responseText.textContent = 'Awesome! What are you interested in?';
                    chatState.step = 1;

                    const optionsContainer = document.createElement('div');
                    optionsContainer.style.display = 'flex';
                    optionsContainer.style.flexWrap = 'wrap';
                    optionsContainer.style.gap = 'var(--spacing-sm)';
                    optionsContainer.style.marginTop = 'var(--spacing-sm)';

                    config.features.chat.demoOptions.forEach(option => {
                        const optionButton = document.createElement('button');
                        optionButton.classList.add('quick-reply-button');
                        optionButton.textContent = option.text;
                        optionButton.addEventListener('click', () => {
                            handleDemoOption(option.value);
                        });
                        optionsContainer.appendChild(optionButton);
                    });

                    const backButton = document.createElement('button');
                    backButton.classList.add('back-button');
                    backButton.textContent = 'Back';
                    backButton.addEventListener('click', () => {
                        chatState.currentFlow = null;
                        chatState.step = 0;
                        quickRepliesContainer.style.display = 'flex';
                        optionsContainer.remove();
                        backButton.remove();
                    });
                    optionsContainer.appendChild(backButton);

                    responseText.appendChild(optionsContainer);
                } else if (flow === 'call' && chatState.step === 0) {
                    responseText.textContent = 'Great! Who would you like to speak with?';
                    chatState.step = 1;

                    const optionsContainer = document.createElement('div');
                    optionsContainer.style.display = 'flex';
                    optionsContainer.style.flexWrap = 'wrap';
                    optionsContainer.style.gap = 'var(--spacing-sm)';
                    optionsContainer.style.marginTop = 'var(--spacing-sm)';

                    config.features.chat.callOptions.forEach(option => {
                        const optionButton = document.createElement('button');
                        optionButton.classList.add('quick-reply-button');
                        optionButton.textContent = option.text;
                        optionButton.addEventListener('click', () => {
                            handleCallOption(option.value);
                        });
                        optionsContainer.appendChild(optionButton);
                    });

                    const backButton = document.createElement('button');
                    backButton.classList.add('back-button');
                    backButton.textContent = 'Back';
                    backButton.addEventListener('click', () => {
                        chatState.currentFlow = null;
                        chatState.step = 0;
                        quickRepliesContainer.style.display = 'flex';
                        optionsContainer.remove();
                        backButton.remove();
                    });
                    optionsContainer.appendChild(backButton);

                    responseText.appendChild(optionsContainer);
                }

                responseContent.appendChild(responseName);
                responseContent.appendChild(responseText);
                responseContent.appendChild(responseTimestamp);
                agentResponse.appendChild(responseAvatar);
                agentResponse.appendChild(responseContent);
                messagesContainer.appendChild(agentResponse);
                agentResponse.classList.add('message-fade-in');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 2000);
        }

        function handleSupportOption(option) {
            const userMessageElement = document.createElement('div');
            userMessageElement.style.display = 'flex';
            userMessageElement.style.flexDirection = 'row-reverse';
            userMessageElement.style.marginBottom = 'var(--spacing-md)';

            const userMessageContent = document.createElement('div');
            userMessageContent.classList.add('message-bubble-user');
            userMessageContent.style.padding = 'var(--spacing-sm) var(--spacing-md)';
            userMessageContent.style.maxWidth = '80%';
            userMessageContent.textContent = option;

            const userMessageTimestamp = document.createElement('div');
            userMessageTimestamp.classList.add('message-timestamp');
            userMessageTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            userMessageContent.appendChild(userMessageTimestamp);
            userMessageElement.appendChild(userMessageContent);
            messagesContainer.appendChild(userMessageElement);
            userMessageElement.classList.add('message-fade-in');

            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            trackInteraction('support_option_selected', { option });

            setTimeout(() => {
                const responseTypingIndicator = document.createElement('div');
                responseTypingIndicator.style.display = 'flex';
                responseTypingIndicator.style.marginBottom = 'var(--spacing-md)';

                const responseTypingAvatar = document.createElement('div');
                responseTypingAvatar.style.width = '32px';
                responseTypingAvatar.style.height = '32px';
                responseTypingAvatar.style.borderRadius = '50%';
                responseTypingAvatar.style.backgroundColor = 'var(--primary)';
                responseTypingAvatar.style.color = '#FFFFFF';
                responseTypingAvatar.style.display = 'flex';
                responseTypingAvatar.style.alignItems = 'center';
                responseTypingAvatar.style.justifyContent = 'center';
                responseTypingAvatar.style.marginRight = 'var(--spacing-sm)';
                responseTypingAvatar.style.flexShrink = '0';
                responseTypingAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

                const responseTypingBubble = document.createElement('div');
                responseTypingBubble.classList.add('typing-indicator');

                responseTypingIndicator.appendChild(responseTypingAvatar);
                responseTypingIndicator.appendChild(responseTypingBubble);
                messagesContainer.appendChild(responseTypingIndicator);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                setTimeout(() => {
                    responseTypingIndicator.style.display = 'none';

                    const agentResponse = document.createElement('div');
                    agentResponse.style.display = 'flex';
                    agentResponse.style.marginBottom = 'var(--spacing-md)';

                    const responseAvatar = responseTypingAvatar.cloneNode(true);
                    const responseContent = document.createElement('div');
                    responseContent.style.maxWidth = '80%';

                    const responseName = document.createElement('div');
                    responseName.style.fontWeight = '600';
                    responseName.style.fontSize = '13px';
                    responseName.style.marginBottom = 'var(--spacing-xs)';
                    responseName.style.color = 'var(--text-secondary)';
                    responseName.textContent = config.features?.chat?.agentName || 'Support Team';

                    const responseText = document.createElement('div');
                    responseText.classList.add('message-bubble-bot');
                    responseText.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                    responseText.textContent = 'Please describe your issue, and we’ll get back to you soon.';

                    const responseTimestamp = document.createElement('div');
                    responseTimestamp.classList.add('message-timestamp');
                    responseTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    responseContent.appendChild(responseName);
                    responseContent.appendChild(responseText);
                    responseContent.appendChild(responseTimestamp);
                    agentResponse.appendChild(responseAvatar);
                    agentResponse.appendChild(responseContent);
                    messagesContainer.appendChild(agentResponse);
                    agentResponse.classList.add('message-fade-in');
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;

                    chatState.step = 2;
                }, 2000);
            }, 1000);
        }

        function handleDemoOption(option) {
            const userMessageElement = document.createElement('div');
            userMessageElement.style.display = 'flex';
            userMessageElement.style.flexDirection = 'row-reverse';
            userMessageElement.style.marginBottom = 'var(--spacing-md)';

            const userMessageContent = document.createElement('div');
            userMessageContent.classList.add('message-bubble-user');
            userMessageContent.style.padding = 'var(--spacing-sm) var(--spacing-md)';
            userMessageContent.style.maxWidth = '80%';
            userMessageContent.textContent = option;

            const userMessageTimestamp = document.createElement('div');
            userMessageTimestamp.classList.add('message-timestamp');
            userMessageTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            userMessageContent.appendChild(userMessageTimestamp);
            userMessageElement.appendChild(userMessageContent);
            messagesContainer.appendChild(userMessageElement);
            userMessageElement.classList.add('message-fade-in');

            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            trackInteraction('demo_option_selected', { option });

            setTimeout(() => {
                const responseTypingIndicator = document.createElement('div');
                responseTypingIndicator.style.display = 'flex';
                responseTypingIndicator.style.marginBottom = 'var(--spacing-md)';

                const responseTypingAvatar = document.createElement('div');
                responseTypingAvatar.style.width = '32px';
                responseTypingAvatar.style.height = '32px';
                responseTypingAvatar.style.borderRadius = '50%';
                responseTypingAvatar.style.backgroundColor = 'var(--primary)';
                responseTypingAvatar.style.color = '#FFFFFF';
                responseTypingAvatar.style.display = 'flex';
                responseTypingAvatar.style.alignItems = 'center';
                responseTypingAvatar.style.justifyContent = 'center';
                responseTypingAvatar.style.marginRight = 'var(--spacing-sm)';
                responseTypingAvatar.style.flexShrink = '0';
                responseTypingAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

                const responseTypingBubble = document.createElement('div');
                responseTypingBubble.classList.add('typing-indicator');

                responseTypingIndicator.appendChild(responseTypingAvatar);
                responseTypingIndicator.appendChild(responseTypingBubble);
                messagesContainer.appendChild(responseTypingIndicator);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                setTimeout(() => {
                    responseTypingIndicator.style.display = 'none';

                    const agentResponse = document.createElement('div');
                    agentResponse.style.display = 'flex';
                    agentResponse.style.marginBottom = 'var(--spacing-md)';

                    const responseAvatar = responseTypingAvatar.cloneNode(true);
                    const responseContent = document.createElement('div');
                    responseContent.style.maxWidth = '80%';

                    const responseName = document.createElement('div');
                    responseName.style.fontWeight = '600';
                    responseName.style.fontSize = '13px';
                    responseName.style.marginBottom = 'var(--spacing-xs)';
                    responseName.style.color = 'var(--text-secondary)';
                    responseName.textContent = config.features?.chat?.agentName || 'Support Team';

                    const responseText = document.createElement('div');
                    responseText.classList.add('message-bubble-bot');
                    responseText.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                    responseText.textContent = 'Let’s schedule your demo!';

                    const iframe = document.createElement('iframe');
                    iframe.src = 'https://calendly.com/junior-hallberg-dealfront/30min?hide_gdpr_banner=1';
                    iframe.classList.add('calendly-iframe');

                    const responseTimestamp = document.createElement('div');
                    responseTimestamp.classList.add('message-timestamp');
                    responseTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    responseText.appendChild(iframe);
                    responseContent.appendChild(responseName);
                    responseContent.appendChild(responseText);
                    responseContent.appendChild(responseTimestamp);
                    agentResponse.appendChild(responseAvatar);
                    agentResponse.appendChild(responseContent);
                    messagesContainer.appendChild(agentResponse);
                    agentResponse.classList.add('message-fade-in');
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;

                    chatState.step = 2;
                }, 2000);
            }, 1000);
        }

        function handleCallOption(option) {
            const userMessageElement = document.createElement('div');
            userMessageElement.style.display = 'flex';
            userMessageElement.style.flexDirection = 'row-reverse';
            userMessageElement.style.marginBottom = 'var(--spacing-md)';

            const userMessageContent = document.createElement('div');
            userMessageContent.classList.add('message-bubble-user');
            userMessageContent.style.padding = 'var(--spacing-sm) var(--spacing-md)';
            userMessageContent.style.maxWidth = '80%';
            userMessageContent.textContent = option;

            const userMessageTimestamp = document.createElement('div');
            userMessageTimestamp.classList.add('message-timestamp');
            userMessageTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            userMessageContent.appendChild(userMessageTimestamp);
            userMessageElement.appendChild(userMessageContent);
            messagesContainer.appendChild(userMessageElement);
            userMessageElement.classList.add('message-fade-in');

            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            trackInteraction('call_option_selected', { option });

            setTimeout(() => {
                const responseTypingIndicator = document.createElement('div');
                responseTypingIndicator.style.display = 'flex';
                responseTypingIndicator.style.marginBottom = 'var(--spacing-md)';

                const responseTypingAvatar = document.createElement('div');
                responseTypingAvatar.style.width = '32px';
                responseTypingAvatar.style.height = '32px';
                responseTypingAvatar.style.borderRadius = '50%';
                responseTypingAvatar.style.backgroundColor = 'var(--primary)';
                responseTypingAvatar.style.color = '#FFFFFF';
                responseTypingAvatar.style.display = 'flex';
                responseTypingAvatar.style.alignItems = 'center';
                responseTypingAvatar.style.justifyContent = 'center';
                responseTypingAvatar.style.marginRight = 'var(--spacing-sm)';
                responseTypingAvatar.style.flexShrink = '0';
                responseTypingAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

                const responseTypingBubble = document.createElement('div');
                responseTypingBubble.classList.add('typing-indicator');

                responseTypingIndicator.appendChild(responseTypingAvatar);
                responseTypingIndicator.appendChild(responseTypingBubble);
                messagesContainer.appendChild(responseTypingIndicator);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                setTimeout(() => {
                    responseTypingIndicator.style.display = 'none';

                    const agentResponse = document.createElement('div');
                    agentResponse.style.display = 'flex';
                    agentResponse.style.marginBottom = 'var(--spacing-md)';

                    const responseAvatar = responseTypingAvatar.cloneNode(true);
                    const responseContent = document.createElement('div');
                    responseContent.style.maxWidth = '80%';

                    const responseName = document.createElement('div');
                    responseName.style.fontWeight = '600';
                    responseName.style.fontSize = '13px';
                    responseName.style.marginBottom = 'var(--spacing-xs)';
                    responseName.style.color = 'var(--text-secondary)';
                    responseName.textContent = config.features?.chat?.agentName || 'Support Team';

                    const responseText = document.createElement('div');
                    responseText.classList.add('message-bubble-bot');
                    responseText.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                    responseText.textContent = 'Please enter your phone number.';

                    const phoneInput = document.createElement('input');
                    phoneInput.type = 'tel';
                    phoneInput.placeholder = 'Your phone number';
                    phoneInput.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                    phoneInput.style.border = '1px solid var(--border)';
                    phoneInput.style.borderRadius = 'var(--radius-sm)';
                    phoneInput.style.fontSize = '14px';
                    phoneInput.style.marginTop = 'var(--spacing-sm)';
                    phoneInput.style.width = '100%';

                    const submitButton = document.createElement('button');
                    submitButton.textContent = 'Submit';
                    submitButton.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                    submitButton.style.background = 'var(--primary)';
                    submitButton.style.color = '#FFFFFF';
                    submitButton.style.border = 'none';
                    submitButton.style.borderRadius = 'var(--radius-sm)';
                    submitButton.style.cursor = 'pointer';
                    submitButton.style.fontSize = '14px';
                    submitButton.style.fontWeight = '500';
                    submitButton.style.marginTop = 'var(--spacing-sm)';
                    submitButton.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease';

                    submitButton.addEventListener('mouseover', () => {
                        submitButton.style.transform = 'translateY(-2px)';
                        submitButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        submitButton.style.background = 'var(--primary-dark)';
                    });
                    submitButton.addEventListener('mouseout', () => {
                        submitButton.style.transform = 'translateY(0)';
                        submitButton.style.boxShadow = 'var(--shadow-sm)';
                        submitButton.style.background = 'var(--primary)';
                    });

                    submitButton.addEventListener('click', () => {
                        const phone = phoneInput.value.trim();
                        if (phone) {
                            trackInteraction('call_request_submitted', { phone, department: option });

                            const successMessage = document.createElement('div');
                            successMessage.style.display = 'flex';
                            successMessage.style.marginBottom = 'var(--spacing-md)';

                            const successAvatar = responseTypingAvatar.cloneNode(true);
                            const successContent = document.createElement('div');
                            successContent.style.maxWidth = '80%';

                            const successName = document.createElement('div');
                            successName.style.fontWeight = '600';
                            successName.style.fontSize = '13px';
                            successName.style.marginBottom = 'var(--spacing-xs)';
                            successName.style.color = 'var(--text-secondary)';
                            successName.textContent = config.features?.chat?.agentName || 'Support Team';

                            const successText = document.createElement('div');
                            successText.classList.add('message-bubble-bot');
                            successText.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                            successText.style.textAlign = 'center';

                            const successIcon = document.createElement('div');
                            successIcon.classList.add('success-icon');
                            successIcon.innerHTML = `
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <polyline class="checkmark" points="20 6 9 17 4 12"></polyline>
                                </svg>
                            `;

                            const successMessageText = document.createElement('div');
                            successMessageText.textContent = 'Request received! We’ll call you shortly.';

                            const successTimestamp = document.createElement('div');
                            successTimestamp.classList.add('message-timestamp');
                            successTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            successText.appendChild(successIcon);
                            successText.appendChild(successMessageText);
                            successContent.appendChild(successName);
                            successContent.appendChild(successText);
                            successContent.appendChild(successTimestamp);
                            successMessage.appendChild(successAvatar);
                            successMessage.appendChild(successContent);
                            messagesContainer.appendChild(successMessage);
                            successMessage.classList.add('message-fade-in');
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;

                            chatState.step = 2;
                            phoneInput.remove();
                            submitButton.remove();
                        }
                    });

                    const responseTimestamp = document.createElement('div');
                    responseTimestamp.classList.add('message-timestamp');
                    responseTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    responseText.appendChild(phoneInput);
                    responseText.appendChild(submitButton);
                    responseContent.appendChild(responseName);
                    responseContent.appendChild(responseText);
                    responseContent.appendChild(responseTimestamp);
                    agentResponse.appendChild(responseAvatar);
                    agentResponse.appendChild(responseContent);
                    messagesContainer.appendChild(agentResponse);
                    agentResponse.classList.add('message-fade-in');
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;

                    chatState.step = 2;
                }, 2000);
            }, 1000);
        }

        function sendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                const userMessageElement = document.createElement('div');
                userMessageElement.style.display = 'flex';
                userMessageElement.style.flexDirection = 'row-reverse';
                userMessageElement.style.marginBottom = 'var(--spacing-md)';

                const userMessageContent = document.createElement('div');
                userMessageContent.classList.add('message-bubble-user');
                userMessageContent.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                userMessageContent.style.maxWidth = '80%';
                userMessageContent.textContent = message;

                const userMessageTimestamp = document.createElement('div');
                userMessageTimestamp.classList.add('message-timestamp');
                userMessageTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                userMessageContent.appendChild(userMessageTimestamp);
                userMessageElement.appendChild(userMessageContent);
                messagesContainer.appendChild(userMessageElement);
                userMessageElement.classList.add('message-fade-in');

                chatInput.value = '';
                sendButton.classList.remove('active');
                quickRepliesContainer.style.display = 'none';
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                trackInteraction('chat_message_sent', { message });

                setTimeout(() => {
                    const responseTypingIndicator = document.createElement('div');
                    responseTypingIndicator.style.display = 'flex';
                    responseTypingIndicator.style.marginBottom = 'var(--spacing-md)';

                    const responseTypingAvatar = document.createElement('div');
                    responseTypingAvatar.style.width = '32px';
                    responseTypingAvatar.style.height = '32px';
                    responseTypingAvatar.style.borderRadius = '50%';
                    responseTypingAvatar.style.backgroundColor = 'var(--primary)';
                    responseTypingAvatar.style.color = '#FFFFFF';
                    responseTypingAvatar.style.display = 'flex';
                    responseTypingAvatar.style.alignItems = 'center';
                    responseTypingAvatar.style.justifyContent = 'center';
                    responseTypingAvatar.style.marginRight = 'var(--spacing-sm)';
                    responseTypingAvatar.style.flexShrink = '0';
                    responseTypingAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

                    const responseTypingBubble = document.createElement('div');
                    responseTypingBubble.classList.add('typing-indicator');

                    responseTypingIndicator.appendChild(responseTypingAvatar);
                    responseTypingIndicator.appendChild(responseTypingBubble);
                    messagesContainer.appendChild(responseTypingIndicator);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;

                    setTimeout(() => {
                        responseTypingIndicator.style.display = 'none';

                        const agentResponse = document.createElement('div');
                        agentResponse.style.display = 'flex';
                        agentResponse.style.marginBottom = 'var(--spacing-md)';

                        const responseAvatar = responseTypingAvatar.cloneNode(true);
                        const responseContent = document.createElement('div');
                        responseContent.style.maxWidth = '80%';

                        const responseName = document.createElement('div');
                        responseName.style.fontWeight = '600';
                        responseName.style.fontSize = '13px';
                        responseName.style.marginBottom = 'var(--spacing-xs)';
                        responseName.style.color = 'var(--text-secondary)';
                        responseName.textContent = config.features?.chat?.agentName || 'Support Team';

                        const responseText = document.createElement('div');
                        responseText.classList.add('message-bubble-bot');
                        responseText.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                        responseText.textContent = 'Thank you for your message. Our team will get back to you shortly.';

                        const responseTimestamp = document.createElement('div');
                        responseTimestamp.classList.add('message-timestamp');
                        responseTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        responseContent.appendChild(responseName);
                        responseContent.appendChild(responseText);
                        responseContent.appendChild(responseTimestamp);
                        agentResponse.appendChild(responseAvatar);
                        agentResponse.appendChild(responseContent);
                        messagesContainer.appendChild(agentResponse);
                        agentResponse.classList.add('message-fade-in');
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }, 2000);
                }, 1000);
            }
        }

        function toggleWidget() {
            if (content.style.display === 'none' || content.style.display === '') {
                content.style.display = 'flex';
                content.classList.remove('scale-out');
                content.classList.add('scale-in');
                content.classList.add('visible');
                button.style.transform = 'scale(1)';
                void iconContainer.offsetWidth;
                iconContainer.classList.add('icon-transition');
                iconContainer.innerHTML = arrowDownSVG;
                floatingBubbles.style.display = 'none';
                showChatScreen();
                trackInteraction('widget_opened');
            } else {
                content.classList.remove('scale-in');
                content.classList.add('scale-out');
                content.classList.remove('visible');
                content.addEventListener('animationend', () => {
                    if (content.classList.contains('scale-out')) {
                        content.style.display = 'none';
                    }
                }, { once: true });
                button.style.transform = 'scale(1)';
                void iconContainer.offsetWidth;
                iconContainer.classList.add('icon-transition');
                iconContainer.innerHTML = chatIconSVG;
                floatingBubbles.style.display = 'flex';
                trackInteraction('widget_closed');
            }
        }

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWidget();
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && content.style.display === 'flex') {
                toggleWidget();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && content.style.display === 'flex') {
                toggleWidget();
            }
        });

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = 'var(--shadow-md)';
        });

        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1.1)';
        });

        // Calendly Event Listener
        function isCalendlyEvent(e) {
            return e.origin === "https://calendly.com" && e.data.event && e.data.event.indexOf("calendly.") === 0;
        }

        window.addEventListener("message", function(e) {
            if (isCalendlyEvent(e) && e.data.event === "calendly.event_scheduled") {
                const eventUri = e.data.payload.event?.uri || "Unknown Event";
                const inviteeUri = e.data.payload.invitee?.uri || "Unknown Invitee";
                if (messagesContainer) {
                    const messageBubble = document.createElement('div');
                    messageBubble.style.display = 'flex';
                    messageBubble.style.marginBottom = 'var(--spacing-md)';
                    const responseAvatar = document.createElement('div');
                    responseAvatar.style.width = '32px';
                    responseAvatar.style.height = '32px';
                    responseAvatar.style.borderRadius = '50%';
                    responseAvatar.style.backgroundColor = 'var(--primary)';
                    responseAvatar.style.color = '#FFFFFF';
                    responseAvatar.style.display = 'flex';
                    responseAvatar.style.alignItems = 'center';
                    responseAvatar.style.justifyContent = 'center';
                    responseAvatar.style.marginRight = 'var(--spacing-sm)';
                    responseAvatar.style.flexShrink = '0';
                    responseAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                    const responseContent = document.createElement('div');
                    responseContent.style.maxWidth = '80%';
                    const responseName = document.createElement('div');
                    responseName.style.fontWeight = '600';
                    responseName.style.fontSize = '13px';
                    responseName.style.marginBottom = 'var(--spacing-xs)';
                    responseName.style.color = 'var(--text-secondary)';
                    responseName.textContent = config.features?.chat?.agentName || 'Support Team';
                    const messageText = document.createElement('div');
                    messageText.classList.add('message-bubble-bot');
                    messageText.style.padding = 'var(--spacing-sm) var(--spacing-md)';
                    messageText.textContent = `🎉 Success! Your meeting is booked. Event: ${eventUri.split('/').pop()}, Invitee: ${inviteeUri.split('/').pop()}`;
                    const responseTimestamp = document.createElement('div');
                    responseTimestamp.classList.add('message-timestamp');
                    responseTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    responseContent.appendChild(responseName);
                    responseContent.appendChild(messageText);
                    responseContent.appendChild(responseTimestamp);
                    messageBubble.appendChild(responseAvatar);
                    messageBubble.appendChild(responseContent);
                    messagesContainer.appendChild(messageBubble);
                    messageBubble.classList.add('message-fade-in');
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    trackInteraction('calendly_booking', { event: eventUri, invitee: inviteeUri });
                }
            }
        });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initWidget();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            initWidget();
        });
    }

    window.addEventListener('load', () => {
        const content = document.getElementById('adealo-widget-content-' + widgetId);
        if (content && content.style.display === 'flex') {
            content.style.display = 'none';
            const button = document.getElementById('adealo-widget-button-' + widgetId);
            button.style.transform = 'scale(1)';
            const iconContainer = button.querySelector('.launcher-icon-container');
            iconContainer.innerHTML = chatIconSVG;
        }
    });
})();