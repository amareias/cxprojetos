document.addEventListener('DOMContentLoaded', () => {
    const chatWidget = document.getElementById('cx-chat-widget');
    const chatTrigger = document.getElementById('cx-chat-trigger');
    const chatContactTrigger = document.getElementById('cx-chat-contact-trigger');
    const chatWindow = document.getElementById('cx-chat-window');
    const chatClose = document.getElementById('cx-chat-close');
    const chatBack = document.getElementById('cx-chat-back');
    const chatMessages = document.getElementById('cx-chat-messages');

    let isChatOpen = false;
    let hasInitiated = false;

    // Toggle Chat
    chatTrigger.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);
    if (chatContactTrigger) {
        chatContactTrigger.addEventListener('click', () => setChatOpen(true));
    }

    // Back Button
    chatBack.addEventListener('click', () => {
        chatBack.classList.remove('visible');
        addMessage("Como podemos ajudar novamente?", "bot");
        addOptions([
            { text: "Quero apresentar meu projeto", value: "proponente" },
            { text: "Quero patrocinar um projeto", value: "patrocinador" }
        ]);
    });

    function toggleChat() {
        setChatOpen(!isChatOpen);
    }

    function setChatOpen(isOpen) {
        isChatOpen = isOpen;
        chatWindow.classList.toggle('active', isChatOpen);
        chatTrigger.classList.toggle('active', isChatOpen);

        if (isChatOpen && !hasInitiated) {
            initChat();
        }
    }

    function initChat() {
        hasInitiated = true;
        addMessage("Olá! 👋<br>Seja bem-vindo(a) à CX Projetos.<br>Como podemos ajudar?", "bot");

        setTimeout(() => {
            addOptions([
                { text: "Quero apresentar meu projeto", value: "proponente" },
                { text: "Quero patrocinar um projeto", value: "patrocinador" }
            ]);
        }, 600);
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `cx-chat-message ${sender}`;
        msgDiv.innerHTML = text;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function addOptions(options) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'cx-chat-options';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'cx-option-btn';
            btn.textContent = opt.text;
            btn.onclick = () => handleSelection(opt);
            optionsDiv.appendChild(btn);
        });

        chatMessages.appendChild(optionsDiv);
        scrollToBottom();
    }

    function handleSelection(option) {
        // Show user choice
        addMessage(option.text, "user");

        // Show back button in header
        chatBack.classList.add('visible');

        // Logic for choice
        setTimeout(() => {
            if (option.value === "proponente") {
                addMessage("Perfeito!<br>Para a análise do seu projeto, solicitamos o envio da Proposta Comercial e da publicação de aprovação em imprensa oficial para o e-mail: <strong>atendimento@cxprojetos.com.br</strong>.<br><br>Havendo oportunidade, nossa equipe entrará em contato.", "bot");
            } else if (option.value === "patrocinador") {
                addMessage("Ótimo!<br>Para patrocinar um projeto, preencha os seus dados e entre em contato com nossa equipe comercial.", "bot");

                setTimeout(() => {
                    showSponsorForm();
                }, 500);
            }
        }, 800);
    }

    function showSponsorForm() {
        const formDiv = document.createElement('div');
        formDiv.className = 'cx-chat-form';
        formDiv.innerHTML = `
            <label>Nome *</label>
            <input type="text" id="cx-form-name" placeholder="Seu nome" required>
            
            <label>E-mail *</label>
            <input type="email" id="cx-form-email" placeholder="Seu e-mail" required>
            
            <label>Telefone *</label>
            <input type="tel" id="cx-form-phone" placeholder="(00) 00000-0000" required>
            
            <label>Mensagem (opcional)</label>
            <textarea id="cx-form-msg" placeholder="Como podemos ajudar?"></textarea>
            
            <button id="cx-form-submit">Enviar e continuar</button>
        `;

        chatMessages.appendChild(formDiv);
        scrollToBottom();

        // Phone Mask Logic
        const phoneInput = document.getElementById('cx-form-phone');
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);

            if (value.length > 10) {
                // (11) 99999-9999
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
            } else if (value.length > 5) {
                // (11) 9999-9999
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
            } else if (value.length > 2) {
                // (11) 9
                value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
            } else if (value.length > 0) {
                // (11
                value = value.replace(/^(\d*)/, "($1");
            }
            e.target.value = value;
        });

        document.getElementById('cx-form-submit').onclick = () => {
            const name = document.getElementById('cx-form-name').value;
            const email = document.getElementById('cx-form-email').value;
            const phone = document.getElementById('cx-form-phone').value;
            const msg = document.getElementById('cx-form-msg').value;

            if (!name || !email || !phone) {
                alert("Por favor, preencha os campos obrigatórios.");
                return;
            }

            // Integração Web3Forms
            // IMPORTANTE: Insira sua chave (Access Key) do Web3Forms fornecida pelo painel deles
            const accessKey = "922a57c6-ab2d-4fbd-b910-73f35a1a1a8a";

            formDiv.style.opacity = '0.5';
            formDiv.style.pointerEvents = 'none';
            document.getElementById('cx-form-submit').textContent = "Enviando...";

            const formData = new FormData();
            formData.append("access_key", accessKey);
            formData.append("subject", "Novo contato de Patrocinador (Chat do Site)");
            formData.append("name", name);
            formData.append("email", email);
            formData.append("phone", phone);
            formData.append("message", msg);

            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
                .then(async (response) => {
                    let json = await response.json();
                    if (response.status === 200) {
                        // Limpa o botão de WhatsApp e exibe mensagem de sucesso
                        addMessage("Excelente! Suas informações foram enviadas com sucesso. Nossa equipe comercial entrará em contato em breve.", "bot");
                    } else {
                        console.error("Web3Forms Erro:", json);
                        addMessage("Ops, houve um erro ao enviar suas informações. Por favor, contate-nos diretamente pelo e-mail: atendimento@cxprojetos.com.br", "bot");

                        // Restaura os botões em caso de falha
                        formDiv.style.opacity = '1';
                        formDiv.style.pointerEvents = 'auto';
                        document.getElementById('cx-form-submit').textContent = "Tentar Novamente";
                    }
                })
                .catch(error => {
                    console.error("Erro na requisição:", error);
                    addMessage("Falha na conexão. Por favor, verifique sua internet e tente enviar novamente.", "bot");

                    formDiv.style.opacity = '1';
                    formDiv.style.pointerEvents = 'auto';
                    document.getElementById('cx-form-submit').textContent = "Tentar Novamente";
                });
        };
    }

    function showWhatsAppButton() {
        const btn = document.createElement('a');
        btn.className = 'cx-whatsapp-btn';
        btn.href = 'https://wa.me/5511999999999'; // Note: Replace with actual number if provided. Using placeholder for now.
        btn.target = '_blank';
        btn.innerHTML = 'Falar com Horácio (WhatsApp)';

        chatMessages.appendChild(btn);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
