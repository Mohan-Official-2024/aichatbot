# OpenRouter AI Chatbot

A simple, elegant web-based chatbot that uses the OpenRouter API to access various AI models including GPT-3.5, GPT-4, Claude, PaLM, and Llama.

## Features

- Clean, responsive chat interface
- Support for multiple AI models through OpenRouter
- Real-time typing indicators
- Persistent chat history (saved between sessions)
- Customizable system prompt to control AI behavior
- API key management (stored in browser localStorage)
- Model selection dropdown
- Mobile-friendly design

## How to Use

1. Open `index.html` in your web browser
2. When prompted, enter your OpenRouter API key
3. Type your message in the text area and press Enter or click Send
4. The AI will respond in the chat window
5. You can change the AI model using the dropdown at the bottom of the page
6. Use the "Clear Chat" button to start a fresh conversation
7. Click "Edit System Prompt" to customize the AI's behavior and personality

### System Prompt Customization

The system prompt is a set of instructions given to the AI model that guides its behavior. By customizing this prompt, you can:

- Change the AI's personality (friendly, professional, creative, etc.)
- Give it specific knowledge or expertise (e.g., "You are a math tutor")
- Set constraints on its responses (e.g., "Keep answers brief")
- Define how it should format responses
- Instruct it to respond in a specific language

Example system prompts:

- "You are a helpful assistant who explains technical concepts in simple terms."
- "You are a creative writing coach. Provide constructive feedback and suggestions."
- "You are a concise assistant. Keep all responses under 100 words."
- "You are a friendly assistant who speaks French and responds to all questions in French."

## Getting an OpenRouter API Key

To use this chatbot, you'll need an API key from OpenRouter:

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Create an account or log in
3. Generate a new API key
4. Copy the key and paste it when prompted in the chatbot

## Technical Details

This project is built with:

- HTML5
- CSS3
- Vanilla JavaScript (no frameworks)

The chatbot communicates with the OpenRouter API, which acts as a unified gateway to various AI models from providers like OpenAI, Anthropic, Google, and Meta.

## API Usage Notes

- The OpenRouter API requires an API key and proper headers
- The chatbot sends the current URL as the HTTP-Referer header (required by OpenRouter)
- Different models may have different pricing and capabilities
- See the [OpenRouter documentation](https://openrouter.ai/docs) for more details

## Privacy

- Your API key is stored only in your browser's localStorage
- Chat messages are sent directly to the OpenRouter API
- No data is stored on any server beyond what OpenRouter requires for API calls

## Customization

You can customize the chatbot by:

- Editing the CSS in `styles.css` to change the appearance
- Modifying the system prompt in `script.js` to change the AI's behavior
- Adding more models to the dropdown in the `addModelSelector` function

## License

This project is open source and available for personal and commercial use.
