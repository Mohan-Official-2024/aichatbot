document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    // Variables
    let apiKey = localStorage.getItem('openRouterApiKey') || '';
    let isWaitingForResponse = false;
    let chatHistory = [];
    let systemPrompt = localStorage.getItem('systemPrompt') || 'You are a helpful assistant.';
    
    // Load chat history from localStorage
    loadChatHistory();
    
    // Check if API key is stored
    if (!apiKey) {
        promptForApiKey();
    }
    
    // Event Listeners
    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Functions
    function promptForApiKey() {
        const key = prompt('Please enter your OpenRouter API key. You can get one at https://openrouter.ai/keys');
        if (key) {
            apiKey = key;
            localStorage.setItem('openRouterApiKey', key);
        } else {
            // If user cancels, show a message in the chat
            addMessageToChat('system', 'You need an OpenRouter API key to use this chatbot. Click the send button to try again.');
        }
    }
    
    function handleSendMessage() {
        const message = userInput.value.trim();
        
        // Check if there's a message and we're not already waiting for a response
        if (message && !isWaitingForResponse) {
            // Check if we have an API key
            if (!apiKey) {
                promptForApiKey();
                return;
            }
            
            // Add user message to chat
            addMessageToChat('user', message);
            
            // Clear input
            userInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Set waiting flag
            isWaitingForResponse = true;
            
            // Disable send button
            sendButton.disabled = true;
            
            // Send to API
            sendToOpenRouter(message);
        }
    }
    
    function addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messagePara = document.createElement('p');
        messagePara.textContent = message;
        
        messageDiv.appendChild(messagePara);
        chatMessages.appendChild(messageDiv);
        
        // Add to chat history
        chatHistory.push({ sender, message });
        saveChatHistory();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            try {
                chatHistory = JSON.parse(savedHistory);
                
                // Clear initial system message if we have history
                if (chatHistory.length > 0) {
                    chatMessages.innerHTML = '';
                }
                
                // Display messages from history
                chatHistory.forEach(item => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${item.sender}`;
                    
                    const messagePara = document.createElement('p');
                    messagePara.textContent = item.message;
                    
                    messageDiv.appendChild(messagePara);
                    chatMessages.appendChild(messageDiv);
                });
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } catch (error) {
                console.error('Error loading chat history:', error);
                chatHistory = [];
            }
        }
    }
    
    function clearChatHistory() {
        chatHistory = [];
        localStorage.removeItem('chatHistory');
        chatMessages.innerHTML = '';
        
        // Add initial system message
        addMessageToChat('system', 'Hello! I\'m your AI assistant. How can I help you today?');
    }
    
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingDiv.appendChild(dot);
        }
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    async function sendToOpenRouter(message) {
        try {
            // Prepare messages array with chat history
            const messages = [
                {
                    role: 'system',
                    content: systemPrompt
                }
            ];
            
            // Add chat history (up to last 10 messages to avoid token limits)
            const historyToInclude = chatHistory.slice(-20, -1); // Exclude the most recent message (already added below)
            
            historyToInclude.forEach(item => {
                if (item.sender === 'user') {
                    messages.push({
                        role: 'user',
                        content: item.message
                    });
                } else if (item.sender === 'assistant') {
                    messages.push({
                        role: 'assistant',
                        content: item.message
                    });
                }
                // Skip 'system' messages in the API request
            });
            
            // Add the current message
            messages.push({
                role: 'user',
                content: message
            });
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.href, // Required for OpenRouter API
                    'X-Title': 'AI Chatbot' // Optional but recommended
                },
                body: JSON.stringify({
                    model: document.getElementById('model-selector').value, // Use selected model
                    messages: messages
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add assistant message to chat
            if (data.choices && data.choices.length > 0) {
                const assistantMessage = data.choices[0].message.content;
                addMessageToChat('assistant', assistantMessage);
            } else {
                throw new Error('No response from the API');
            }
            
        } catch (error) {
            console.error('Error:', error);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add error message to chat
            if (error.message.includes('API key')) {
                addMessageToChat('system', 'Invalid API key. Please try again.');
                apiKey = '';
                localStorage.removeItem('openRouterApiKey');
                promptForApiKey();
            } else {
                addMessageToChat('system', `Error: ${error.message}. Please try again later.`);
            }
        } finally {
            // Reset waiting flag
            isWaitingForResponse = false;
            
            // Enable send button
            sendButton.disabled = false;
        }
    }
    
    // Add a settings button to change API key
    function addSettingsButton() {
        const footer = document.querySelector('footer');
        
        const settingsButton = document.createElement('button');
        settingsButton.textContent = 'Change API Key';
        settingsButton.style.marginTop = '10px';
        settingsButton.style.padding = '5px 10px';
        settingsButton.style.backgroundColor = '#f0f2f5';
        settingsButton.style.border = '1px solid #ddd';
        settingsButton.style.borderRadius = '5px';
        settingsButton.style.cursor = 'pointer';
        
        settingsButton.addEventListener('click', () => {
            promptForApiKey();
        });
        
        footer.appendChild(settingsButton);
    }
    
    // Add model selector
    function addModelSelector() {
        const footer = document.querySelector('footer');
        
        const modelSelector = document.createElement('select');
        modelSelector.id = 'model-selector';
        modelSelector.style.marginTop = '10px';
        modelSelector.style.marginLeft = '10px';
        modelSelector.style.padding = '5px';
        modelSelector.style.border = '1px solid #ddd';
        modelSelector.style.borderRadius = '5px';
        
        const models = [
            { value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
            { value: 'openai/gpt-4', label: 'GPT-4' },
            { value: 'anthropic/claude-2', label: 'Claude 2' },
            { value: 'google/palm-2-chat-bison', label: 'PaLM 2 Chat' },
            { value: 'meta-llama/llama-2-13b-chat', label: 'Llama 2 13B' }
        ];
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.label;
            modelSelector.appendChild(option);
        });
        
        const modelLabel = document.createElement('label');
        modelLabel.htmlFor = 'model-selector';
        modelLabel.textContent = 'Model: ';
        modelLabel.style.marginTop = '10px';
        modelLabel.style.marginLeft = '10px';
        
        footer.appendChild(modelLabel);
        footer.appendChild(modelSelector);
    }
    
    // Add clear chat button
    function addClearChatButton() {
        const footer = document.querySelector('footer');
        
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear Chat';
        clearButton.style.marginTop = '10px';
        clearButton.style.marginLeft = '10px';
        clearButton.style.padding = '5px 10px';
        clearButton.style.backgroundColor = '#f0f2f5';
        clearButton.style.border = '1px solid #ddd';
        clearButton.style.borderRadius = '5px';
        clearButton.style.cursor = 'pointer';
        
        clearButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the chat history?')) {
                clearChatHistory();
            }
        });
        
        footer.appendChild(clearButton);
    }
    
    // Function to prompt for system prompt edit
    function promptForSystemPrompt() {
        const currentPrompt = systemPrompt;
        const newPrompt = prompt('Edit the system prompt (instructions for the AI):', currentPrompt);
        
        if (newPrompt !== null && newPrompt.trim() !== '') {
            systemPrompt = newPrompt.trim();
            localStorage.setItem('systemPrompt', systemPrompt);
            addMessageToChat('system', 'System prompt updated. This will affect future messages.');
        }
    }
    
    // Add system prompt button
    function addSystemPromptButton() {
        const footer = document.querySelector('footer');
        
        const promptButton = document.createElement('button');
        promptButton.textContent = 'Edit System Prompt';
        promptButton.style.marginTop = '10px';
        promptButton.style.marginLeft = '10px';
        promptButton.style.padding = '5px 10px';
        promptButton.style.backgroundColor = '#f0f2f5';
        promptButton.style.border = '1px solid #ddd';
        promptButton.style.borderRadius = '5px';
        promptButton.style.cursor = 'pointer';
        
        promptButton.addEventListener('click', () => {
            promptForSystemPrompt();
        });
        
        footer.appendChild(promptButton);
    }
    
    // Initialize UI components
    addSettingsButton();
    addModelSelector();
    addClearChatButton();
    addSystemPromptButton();
});
