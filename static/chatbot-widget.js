

/**
 * QA Chatbot Widget v1.0.0
 * Un widget de chatbot embebible basado en un modelo de preguntas y respuestas.
 * 
 * Uso:
 * <script src="chatbot-widget.js" 
 *   data-api-url="http://midominio.com/qa"
 *   data-theme="light"
 *   data-accent-color="#4a6cf7"
 *   data-header-text="Asistente IA"
 *   data-welcome-message="¡Hola! Pregúntame lo que quieras saber."
 * ></script>
 */
(function() {
    'use strict';
  
    // Autoejecución al cargar
    function init() {
      // Extraer configuración desde atributos data
      const scriptElement = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
      })();
  
      // Configuración principal del widget con valores por defecto
      const config = {
        // Endpoint API
        apiUrl: scriptElement.getAttribute('data-api-url') || 'http://0.0.0.0:8000/qa',
        
        // Textos
        headerText: scriptElement.getAttribute('data-header-text') || 'Asistente IA',
        placeholderText: scriptElement.getAttribute('data-placeholder') || '¿Qué quieres saber?',
        welcomeMessage: scriptElement.getAttribute('data-welcome-message') || '¡Hola! Soy un asistente de IA. ¿En qué puedo ayudarte?',
        loadingText: scriptElement.getAttribute('data-loading-text') || 'Pensando...',
        errorText: scriptElement.getAttribute('data-error-text') || 'No pude obtener una respuesta. Inténtalo de nuevo.',
        sendButtonText: scriptElement.getAttribute('data-send-button-text') || 'Enviar',
        
        // Estilo y tema
        theme: (scriptElement.getAttribute('data-theme') || 'light').toLowerCase(), // 'light' o 'dark'
        accentColor: scriptElement.getAttribute('data-accent-color') || '#4a6cf7',
        fontFamily: scriptElement.getAttribute('data-font-family') || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        borderRadius: scriptElement.getAttribute('data-border-radius') || '10px',
        buttonShape: (scriptElement.getAttribute('data-button-shape') || 'circle').toLowerCase(), // 'circle' o 'pill'
        
        // Comportamiento
        position: (scriptElement.getAttribute('data-position') || 'bottom-right').toLowerCase(), // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
        autoOpen: scriptElement.getAttribute('data-auto-open') === 'true',
        autoOpenDelay: parseInt(scriptElement.getAttribute('data-auto-open-delay') || '3000', 10),
        showAvatar: scriptElement.getAttribute('data-show-avatar') !== 'false',
        showTimestamp: scriptElement.getAttribute('data-show-timestamp') !== 'false',
        persistHistory: scriptElement.getAttribute('data-persist-history') !== 'false',
        maxHistoryMessages: parseInt(scriptElement.getAttribute('data-max-history') || '50', 10),
  
        // Íconos y gráficos
        buttonIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
        closeIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        sendIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
        userAvatar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
        botAvatar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
      };
  
      // Calcular colores derivados
      const derivedColors = getDerivedColors(config.accentColor, config.theme);
  
      // Crear los estilos CSS
      const styles = generateStyles(config, derivedColors);
  
      // Insertar estilos
      const styleTag = document.createElement('style');
      styleTag.innerHTML = styles;
      document.head.appendChild(styleTag);
  
      // Crear la estructura HTML del widget
      createWidget(config);
  
      // Inicializar comportamiento
      initializeWidgetBehavior(config);
    }
  
    // Función para generar colores derivados basados en un color principal
    function getDerivedColors(accentColor, theme) {
      function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }
  
      const rgb = hexToRgb(accentColor);
      
      // Crear versiones con transparencia
      const accentLight = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
      const accentMedium = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
      
      // Crear colores para tema claro/oscuro
      const isDark = theme === 'dark';
      const bgColor = isDark ? '#1e1e2e' : 'white';
      const textColor = isDark ? '#e9ecef' : '#333333';
      const containerBg = isDark ? '#2a2a3c' : '#f9fafc';
      const inputBg = isDark ? '#1e1e2e' : 'white';
      const inputBorder = isDark ? '#3f3f5a' : '#e0e0e0';
      const userBubbleBg = accentColor;
      const userBubbleColor = 'white';
      const botBubbleBg = isDark ? '#3a3a4a' : 'white';
      const botBubbleColor = textColor;
      const timestampColor = isDark ? '#9ca3af' : '#9ca3af';
      const scrollbarThumb = isDark ? '#4a4a5a' : '#d1d5db';
      const scrollbarTrack = isDark ? '#2a2a3c' : '#f1f5f9';
      
      return {
        accentLight,
        accentMedium,
        bgColor,
        textColor,
        containerBg,
        inputBg,
        inputBorder,
        userBubbleBg,
        userBubbleColor,
        botBubbleBg,
        botBubbleColor,
        timestampColor,
        scrollbarThumb,
        scrollbarTrack
      };
    }
  
    // Función para generar estilos CSS
    function generateStyles(config, colors) {
      // Calcular la posición basada en la configuración
      let positionCSS = '';
      switch(config.position) {
        case 'bottom-right':
          positionCSS = 'bottom: 20px; right: 20px;';
          break;
        case 'bottom-left':
          positionCSS = 'bottom: 20px; left: 20px;';
          break;
        case 'top-right':
          positionCSS = 'top: 20px; right: 20px;';
          break;
        case 'top-left':
          positionCSS = 'top: 20px; left: 20px;';
          break;
        default:
          positionCSS = 'bottom: 20px; right: 20px;';
      }
  
      // Calcular forma del botón
      const buttonBorderRadius = config.buttonShape === 'circle' ? '50%' : '30px';
  
      return `
        /* QA Chatbot Widget Styles */
        .qa-chatbot-widget {
          font-family: ${config.fontFamily};
          position: fixed;
          ${positionCSS}
          z-index: 99999;
          color: ${colors.textColor};
          box-sizing: border-box;
        }
        
        .qa-chatbot-widget * {
          box-sizing: border-box;
        }
  
        .qa-chatbot-button {
          width: 60px;
          height: 60px;
          border-radius: ${buttonBorderRadius};
          background-color: ${config.accentColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: none;
          outline: none;
        }
  
        .qa-chatbot-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .qa-chatbot-button:active {
          transform: scale(0.95);
        }
  
        .qa-chatbot-container {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 360px;
          height: 520px;
          background-color: ${colors.containerBg};
          border-radius: ${config.borderRadius};
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          opacity: 0;
          transform: translateY(20px) scale(0.9);
          pointer-events: none;
          border: 1px solid ${colors.inputBorder};
        }
        
        /* Ajuste por posición */
        .qa-chatbot-widget.top-left .qa-chatbot-container,
        .qa-chatbot-widget.top-right .qa-chatbot-container {
          bottom: auto;
          top: 80px;
        }
        
        .qa-chatbot-widget.bottom-left .qa-chatbot-container,
        .qa-chatbot-widget.top-left .qa-chatbot-container {
          right: auto;
          left: 0;
        }
  
        .qa-chatbot-container.active {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }
  
        .qa-chatbot-header {
          background-color: ${config.accentColor};
          color: white;
          padding: 15px 20px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .qa-chatbot-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
  
        .qa-chatbot-close {
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
        }
  
        .qa-chatbot-close:hover {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.2);
        }
  
        .qa-chatbot-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${colors.scrollbarThumb} ${colors.scrollbarTrack};
          scroll-behavior: smooth;
        }
        
        .qa-chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }
        
        .qa-chatbot-messages::-webkit-scrollbar-track {
          background: ${colors.scrollbarTrack};
        }
        
        .qa-chatbot-messages::-webkit-scrollbar-thumb {
          background-color: ${colors.scrollbarThumb};
          border-radius: 6px;
        }
  
        .qa-chatbot-input-container {
          padding: 15px;
          border-top: 1px solid ${colors.inputBorder};
          display: flex;
          background-color: ${colors.bgColor};
        }
  
        .qa-chatbot-input {
          flex: 1;
          padding: 12px 15px;
          border: 1px solid ${colors.inputBorder};
          border-radius: 20px;
          outline: none;
          font-size: 14px;
          background-color: ${colors.inputBg};
          color: ${colors.textColor};
          transition: border-color 0.2s, box-shadow 0.2s;
        }
  
        .qa-chatbot-input:focus {
          border-color: ${config.accentColor};
          box-shadow: 0 0 0 2px ${colors.accentLight};
        }
  
        .qa-chatbot-send {
          background-color: ${config.accentColor};
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-left: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, transform 0.2s;
        }
        
        .qa-chatbot-send:disabled {
          background-color: ${colors.accentMedium};
          cursor: not-allowed;
        }
  
        .qa-chatbot-send:hover:not(:disabled) {
          background-color: ${config.accentColor};
          filter: brightness(1.1);
          transform: scale(1.05);
        }
        
        .qa-chatbot-send:active:not(:disabled) {
          transform: scale(0.95);
        }
  
        .qa-message-row {
          display: flex;
          margin-bottom: 15px;
          position: relative;
          clear: both;
          width: 100%;
          animation: qa-message-fade-in 0.3s ease-out forwards;
        }
        
        @keyframes qa-message-fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .qa-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          flex-shrink: 0;
        }
        
        .qa-avatar.user {
          background-color: ${colors.accentLight};
          color: ${config.accentColor};
        }
        
        .qa-avatar.bot {
          background-color: ${colors.accentLight};
          color: ${config.accentColor};
        }
  
        .qa-message-container {
          display: flex;
          flex-direction: column;
          max-width: 85%;
        }
  
        .qa-message {
          padding: 10px 15px;
          border-radius: 18px;
          position: relative;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.5;
        }
  
        .qa-user-message {
          background-color: ${colors.userBubbleBg};
          color: ${colors.userBubbleColor};
          border-top-right-radius: 4px;
          align-self: flex-end;
          margin-left: auto;
        }
  
        .qa-bot-message {
          background-color: ${colors.botBubbleBg};
          color: ${colors.botBubbleColor};
          border-top-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .qa-timestamp {
          font-size: 11px;
          color: ${colors.timestampColor};
          margin-top: 4px;
          opacity: 0.8;
        }
        
        .qa-user-row {
          justify-content: flex-end;
        }
        
        .qa-user-row .qa-avatar {
          order: 2;
          margin-right: 0;
          margin-left: 8px;
        }
        
        .qa-user-row .qa-message-container {
          align-items: flex-end;
        }
        
        .qa-bot-row .qa-message-container {
          align-items: flex-start;
        }
  
        .qa-loading {
          display: flex;
          padding: 12px 15px;
          align-items: center;
          background-color: ${colors.botBubbleBg};
          border-radius: 18px;
          border-top-left-radius: 4px;
        }
  
        .qa-dot {
          width: 8px;
          height: 8px;
          background: ${colors.accentMedium};
          border-radius: 50%;
          margin: 0 3px;
          animation: qa-dot-animation 1.4s infinite ease-in-out both;
        }
  
        .qa-dot:nth-child(1) { animation-delay: -0.32s; }
        .qa-dot:nth-child(2) { animation-delay: -0.16s; }
  
        @keyframes qa-dot-animation {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
  
        .qa-error {
          background-color: #fff0f0;
          color: #e74c3c;
          padding: 12px 15px;
          border-radius: 18px;
          border-top-left-radius: 4px;
          font-size: 14px;
        }
        
        /* Versiones responsivas */
        @media (max-width: 450px) {
          .qa-chatbot-container {
            width: calc(100vw - 40px);
            right: 0;
            left: 0;
            margin: 0 auto;
            bottom: 85px;
          }
        }
      `;
    }
  
    // Función para crear la estructura HTML del widget
    function createWidget(config) {
      // Calcular la clase de posición
      const positionClass = config.position || 'bottom-right';
  
      // Crear el widget
      const widget = document.createElement('div');
      widget.className = `qa-chatbot-widget ${positionClass}`;
      widget.innerHTML = `
        <button class="qa-chatbot-button" type="button" aria-label="Abrir asistente de chat">
          ${config.buttonIcon}
        </button>
        <div class="qa-chatbot-container">
          <div class="qa-chatbot-header">
            <div class="qa-chatbot-header-title">
              ${config.botAvatar}
              <span>${config.headerText}</span>
            </div>
            <div class="qa-chatbot-close" aria-label="Cerrar chat">
              ${config.closeIcon}
            </div>
          </div>
          <div class="qa-chatbot-messages" aria-live="polite"></div>
          <div class="qa-chatbot-input-container">
            <input type="text" class="qa-chatbot-input" placeholder="${config.placeholderText}" aria-label="Escribe tu pregunta">
            <button class="qa-chatbot-send" type="button" aria-label="Enviar pregunta">
              ${config.sendIcon}
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(widget);
    }
  
    // Función para inicializar el comportamiento del widget
    function initializeWidgetBehavior(config) {
      // Capturar los elementos del DOM
      const widget = document.querySelector('.qa-chatbot-widget');
      const chatbotButton = widget.querySelector('.qa-chatbot-button');
      const chatbotContainer = widget.querySelector('.qa-chatbot-container');
      const chatbotClose = widget.querySelector('.qa-chatbot-close');
      const messagesContainer = widget.querySelector('.qa-chatbot-messages');
      const chatInput = widget.querySelector('.qa-chatbot-input');
      const sendButton = widget.querySelector('.qa-chatbot-send');
  
      // Historial de mensajes
      let chatHistory = [];
      
      // Recuperar historial del localStorage si está habilitado
      if (config.persistHistory) {
        try {
          const savedHistory = localStorage.getItem('qa-chatbot-history');
          if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            
            // Limitar el historial al máximo configurado
            if (chatHistory.length > config.maxHistoryMessages) {
              chatHistory = chatHistory.slice(-config.maxHistoryMessages);
            }
            
            // Restaurar mensajes guardados
            chatHistory.forEach(message => {
              addMessageToDOM(message.text, message.type, new Date(message.timestamp));
            });
          }
        } catch (e) {
          console.error('Error al cargar el historial del chat:', e);
        }
      }
  
      // Si no hay historial o está deshabilitado, mostrar mensaje de bienvenida
      if (messagesContainer.children.length === 0) {
        setTimeout(() => {
          addMessage(config.welcomeMessage, 'bot');
        }, 500);
      }
      
      // Autoabrir el chat si está configurado
      if (config.autoOpen) {
        setTimeout(() => {
          chatbotContainer.classList.add('active');
        }, config.autoOpenDelay);
      }
  
      // Funcionalidad para abrir/cerrar el chatbot
      chatbotButton.addEventListener('click', () => {
        chatbotContainer.classList.add('active');
        chatInput.focus();
      });
  
      chatbotClose.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
      });
  
      // Función para agregar un mensaje al historial y al DOM
      function addMessage(message, type, timestamp = new Date()) {
        // Agregar al historial
        if (type !== 'loading' && type !== 'error') {
          chatHistory.push({
            text: message,
            type: type,
            timestamp: timestamp.toISOString()
          });
          
          // Limitar el historial al máximo configurado
          if (chatHistory.length > config.maxHistoryMessages) {
            chatHistory.shift();
          }
          
          // Guardar en localStorage si está habilitado
          if (config.persistHistory) {
            try {
              localStorage.setItem('qa-chatbot-history', JSON.stringify(chatHistory));
            } catch (e) {
              console.error('Error al guardar el historial del chat:', e);
            }
          }
        }
        
        // Agregar al DOM
        addMessageToDOM(message, type, timestamp);
      }
      
      // Función para formatear timestamp
      function formatTimestamp(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Función para agregar un mensaje al DOM
      function addMessageToDOM(message, type, timestamp) {
        if (type === 'loading') {
          const loadingElement = document.createElement('div');
          loadingElement.className = 'qa-message-row qa-bot-row';
          
          let avatarHTML = '';
          if (config.showAvatar) {
            avatarHTML = `<div class="qa-avatar bot">${config.botAvatar}</div>`;
          }
          
          loadingElement.innerHTML = `
            ${avatarHTML}
            <div class="qa-message-container">
              <div class="qa-loading">
                <div class="qa-dot"></div>
                <div class="qa-dot"></div>
                <div class="qa-dot"></div>
              </div>
              ${config.showTimestamp ? `<div class="qa-timestamp">${formatTimestamp(timestamp)}</div>` : ''}
            </div>
          `;
          messagesContainer.appendChild(loadingElement);
          return loadingElement;
        } else if (type === 'error') {
          const errorElement = document.createElement('div');
          errorElement.className = 'qa-message-row qa-bot-row';
          
          let avatarHTML = '';
          if (config.showAvatar) {
            avatarHTML = `<div class="qa-avatar bot">${config.botAvatar}</div>`;
          }
          
          errorElement.innerHTML = `
            ${avatarHTML}
            <div class="qa-message-container">
              <div class="qa-error">${message}</div>
              ${config.showTimestamp ? `<div class="qa-timestamp">${formatTimestamp(timestamp)}</div>` : ''}
            </div>
          `;
          messagesContainer.appendChild(errorElement);
          return errorElement;
        } else {
          const isUser = type === 'user';
          const messageElement = document.createElement('div');
          messageElement.className = `qa-message-row qa-${isUser ? 'user' : 'bot'}-row`;
          
          let avatarHTML = '';
          if (config.showAvatar) {
            avatarHTML = `<div class="qa-avatar ${isUser ? 'user' : 'bot'}">${isUser ? config.userAvatar : config.botAvatar}</div>`;
          }
          
          messageElement.innerHTML = `
            ${avatarHTML}
            <div class="qa-message-container">
              <div class="qa-message qa-${isUser ? 'user' : 'bot'}-message">${message}</div>
              ${config.showTimestamp ? `<div class="qa-timestamp">${formatTimestamp(timestamp)}</div>` : ''}
            </div>
          `;
          messagesContainer.appendChild(messageElement);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          return messageElement;
        }
      }
  
      // Función para enviar pregunta
      async function sendQuestion() {
        const question = chatInput.value.trim();
        if (!question) return;
  
        // Limpiar el input y deshabilitarlo mientras se procesa
        chatInput.value = '';
        chatInput.disabled = true;
        sendButton.disabled = true;
  
        // Añadir la pregunta al chat
        addMessage(question, 'user');
  
        // Mostrar indicador de carga
        const loadingElement = addMessageToDOM(config.loadingText, 'loading', new Date());
  
        try {
          // Enviar la pregunta al backend
          const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
          });
  
          // Eliminar el indicador de carga
          if (loadingElement && loadingElement.parentNode) {
            loadingElement.remove();
          }
  
          // Habilitar el input y el botón de enviar
          chatInput.disabled = false;
          sendButton.disabled = false;
          chatInput.focus();
  
          if (!response.ok) {
            throw new Error(`${response.status}: ${await response.text()}`);
          }
  
          const data = await response.json();
          
          // Mostrar la respuesta
          addMessage(data.answer, 'bot');
        } catch (error) {
          // Eliminar el indicador de carga
          if (loadingElement && loadingElement.parentNode) {
            loadingElement.remove();
          }
          
          // Habilitar el input y el botón de enviar
          chatInput.disabled = false;
          sendButton.disabled = false;
          chatInput.focus();
          
          // Mostrar el error
          const errorMessage = config.errorText + (error.message ? ` (${error.message})` : '');
          addMessageToDOM(errorMessage, 'error', new Date());
          
          console.error('Error en la petición:', error);
        }
      }
  
      // Event listeners para enviar pregunta
      sendButton.addEventListener('click', sendQuestion);
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendQuestion();
        }
      });
      


        // Verificar estado de input para habilitar/deshabilitar botón de enviar
    chatInput.addEventListener('input', () => {
        sendButton.disabled = chatInput.value.trim() === '';
      });
      
      // Inicializar estado del botón de enviar
      sendButton.disabled = chatInput.value.trim() === '';
      
      // Autoenfoque en input cuando se abre el chatbot
      chatbotContainer.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && chatbotContainer.classList.contains('active')) {
          chatInput.focus();
        }
      });
  
      // Función para borrar todo el historial de chat
      function clearChatHistory() {
        // Limpiar el historial
        chatHistory = [];
        
        // Limpiar el localStorage si está habilitado
        if (config.persistHistory) {
          try {
            localStorage.removeItem('qa-chatbot-history');
          } catch (e) {
            console.error('Error al borrar el historial del chat:', e);
          }
        }
        
        // Limpiar el DOM
        messagesContainer.innerHTML = '';
        
        // Mostrar mensaje de bienvenida
        setTimeout(() => {
          addMessage(config.welcomeMessage, 'bot');
        }, 500);
      }
      
      // Exponer API pública
      window.QAChatbotWidget = {
        open: () => chatbotContainer.classList.add('active'),
        close: () => chatbotContainer.classList.remove('active'),
        toggle: () => chatbotContainer.classList.toggle('active'),
        isOpen: () => chatbotContainer.classList.contains('active'),
        clearHistory: clearChatHistory,
        sendMessage: (message) => {
          if (message && typeof message === 'string') {
            chatInput.value = message;
            sendQuestion();
            return true;
          }
          return false;
        }
      };
      
      // Agregar soporte para eventos de ventana modal (prevenir cierre accidental)
      chatbotContainer.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      // Cerrar al hacer clic fuera del chatbot si está abierto
      document.addEventListener('click', (e) => {
        if (
          chatbotContainer.classList.contains('active') && 
          !chatbotContainer.contains(e.target) && 
          !chatbotButton.contains(e.target)
        ) {
          chatbotContainer.classList.remove('active');
        }
      });
      
      // Agregar soporte para accesibilidad con teclado
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatbotContainer.classList.contains('active')) {
          chatbotContainer.classList.remove('active');
        }
      });
      
      // Detectar cambios de tema del sistema si el tema es 'auto'
      if (config.theme === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateTheme = (e) => {
          const isDark = e.matches;
          const newTheme = isDark ? 'dark' : 'light';
          const derivedColors = getDerivedColors(config.accentColor, newTheme);
          const newStyles = generateStyles(config, derivedColors);
          
          // Actualizar estilos
          const styleTag = document.querySelector('style');
          if (styleTag) {
            styleTag.innerHTML = newStyles;
          }
        };
        
        // Inicializar tema
        updateTheme(mediaQuery);
        
        // Escuchar cambios
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', updateTheme);
        } else {
          // Fallback para navegadores antiguos
          mediaQuery.addListener(updateTheme);
        }
      }
    }
  
    // Iniciar el widget cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();