// ==================================================
// CONTATO: botão "Contact", painel, formulário,
// localStorage (fica salvo no navegador) e sessionStorage (vale só enquanto a aba está aberta)
//
//  localStorage   -> tema (claro/escuro), rascunho do formulário, histórico de mensagens enviadas
//  sessionStorage -> se o painel estava aberto e quantas mensagens foram enviadas nesta visita
// ==================================================
(() => {
    "use strict";

    // Seus dados de contato (mude aqui se precisar)
    const CONTATO = {
        email: "pedropauloo894@gmail.com",
        whatsappNumero: "5531997451069",        // só números, com código do país (55) e DDD
        whatsappTexto: "+55 31 99745-1069",     // como aparece no painel
        linkedinUrl: "https://www.linkedin.com/in/pedro-paulo-1b8a32442",
        linkedinTexto: "@pedro-paulo",
        // Opcional: URL de um serviço de formulário (ex.: Formspree "https://formspree.io/f/xxxxxxx").
        // Vazio = o formulário abre o app de email já preenchido (mailto).
        endpoint: ""
    };

    const CHAVES = {
        tema: "pp_tema",
        rascunho: "pp_rascunho",
        historico: "pp_historico",
        abertoSessao: "pp_contato_aberto",
        enviadasSessao: "pp_enviadas_sessao"
    };

    // ---- Acesso seguro aos storages (o navegador pode bloquear; nesse caso o site continua funcionando) ----
    const pegarStorage = (nome) => { try { return window[nome]; } catch { return null; } };
    const criarStorage = (storage) => ({
        ler(chave, padrao = null) {
            if (!storage) return padrao;
            try {
                const bruto = storage.getItem(chave);
                return bruto === null ? padrao : JSON.parse(bruto);
            } catch { return padrao; }
        },
        gravar(chave, valor) {
            if (!storage) return;
            try { storage.setItem(chave, JSON.stringify(valor)); } catch { /* cheio ou bloqueado */ }
        },
        remover(chave) {
            if (!storage) return;
            try { storage.removeItem(chave); } catch { /* ignora */ }
        }
    });
    const local = criarStorage(pegarStorage("localStorage"));
    const sessao = criarStorage(pegarStorage("sessionStorage"));

    document.addEventListener("DOMContentLoaded", () => {
        const overlay = document.getElementById("contatoOverlay");
        if (!overlay) return;

        const botaoTema = document.getElementById("themeToggle");
        const btnAbrir = document.getElementById("btnContato");
        const btnFechar = document.getElementById("contatoFechar");
        const form = document.getElementById("contatoForm");
        const btnEnviar = document.getElementById("btnEnviar");
        const btnEnviarTexto = btnEnviar.querySelector(".btn-enviar-texto");
        const btnLimpar = document.getElementById("btnLimpar");
        const status = document.getElementById("contatoStatus");
        const indicadorRascunho = document.getElementById("contatoRascunho");
        const indicadorHistorico = document.getElementById("contatoHistorico");
        const contador = document.getElementById("contadorMsg");

        const campos = {
            nome: document.getElementById("cNome"),
            email: document.getElementById("cEmail"),
            msg: document.getElementById("cMsg")
        };
        const erros = {
            nome: document.getElementById("eNome"),
            email: document.getElementById("eEmail"),
            msg: document.getElementById("eMsg")
        };

        // ==================================================
        // 1. TEMA SALVO (localStorage)
        //    Reaproveita o botão de tema que já existe: se o visitante deixou o escuro
        //    da última vez, "clicamos" nele ao carregar; e a cada troca salvamos a escolha.
        // ==================================================
        if (botaoTema) {
            if (local.ler(CHAVES.tema) === "dark" && !document.body.classList.contains("dark-mode")) {
                botaoTema.click();
            }
            botaoTema.addEventListener("click", () => {
                local.gravar(CHAVES.tema, document.body.classList.contains("dark-mode") ? "dark" : "light");
            });
        }

        // ==================================================
        // 2. CANAIS (preenchidos a partir da configuração lá em cima)
        // ==================================================
        const canais = {
            email: { href: `mailto:${CONTATO.email}`, texto: CONTATO.email },
            whatsapp: { href: `https://wa.me/${CONTATO.whatsappNumero}`, texto: CONTATO.whatsappTexto },
            linkedin: { href: CONTATO.linkedinUrl, texto: CONTATO.linkedinTexto }
        };
        overlay.querySelectorAll("[data-canal]").forEach((a) => {
            const c = canais[a.dataset.canal];
            if (!c) return;
            a.href = c.href;
            a.querySelector(".canal-valor").textContent = c.texto;
        });

        // ==================================================
        // 3. ABRIR / FECHAR O PAINEL (+ estado no sessionStorage)
        // ==================================================
        let ultimoFoco = null;

        const formatarData = (ts) =>
            new Date(ts).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });

        const atualizarHistorico = () => {
            const hist = local.ler(CHAVES.historico, []);
            const nestaSessao = sessao.ler(CHAVES.enviadasSessao, 0);
            if (!hist.length) {
                indicadorHistorico.textContent = "No messages sent from this device yet.";
                return;
            }
            const ultima = hist[hist.length - 1];
            indicadorHistorico.textContent =
                `Last message: ${formatarData(ultima.data)} · ${nestaSessao} this visit · ${hist.length} total`;
        };

        const abrir = (restaurando = false) => {
            ultimoFoco = document.activeElement;
            overlay.classList.add("aberto");
            document.body.classList.add("contato-aberto");
            overlay.setAttribute("aria-hidden", "false");
            sessao.gravar(CHAVES.abertoSessao, true);
            atualizarHistorico();
            if (!restaurando) setTimeout(() => campos.nome.focus(), 120);
        };

        const fechar = () => {
            overlay.classList.remove("aberto");
            document.body.classList.remove("contato-aberto");
            overlay.setAttribute("aria-hidden", "true");
            sessao.gravar(CHAVES.abertoSessao, false);
            if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
        };

        btnAbrir.addEventListener("click", () => abrir());
        btnFechar.addEventListener("click", fechar);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) fechar(); });

        document.addEventListener("keydown", (e) => {
            if (!overlay.classList.contains("aberto")) return;

            if (e.key === "Escape") { fechar(); return; }

            // mantém o Tab dentro do painel enquanto ele está aberto
            if (e.key === "Tab") {
                const focaveis = Array.from(overlay.querySelectorAll("a[href], button:not([disabled]), input, textarea"));
                if (!focaveis.length) return;
                const primeiro = focaveis[0];
                const ultimo = focaveis[focaveis.length - 1];
                if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
                else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
            }
        });

        // ==================================================
        // 4. VALIDAÇÃO
        // ==================================================
        const REGRAS = {
            nome: (v) => (v.trim().length >= 2 ? "" : "Tell me your name (at least 2 letters)."),
            email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email so I can reply."),
            msg: (v) => (v.trim().length >= 10 ? "" : "Write a little more (at least 10 characters).")
        };

        const validarCampo = (chave) => {
            const mensagem = REGRAS[chave](campos[chave].value);
            erros[chave].textContent = mensagem;
            campos[chave].setAttribute("aria-invalid", mensagem ? "true" : "false");
            return !mensagem;
        };

        const limparErros = () => {
            Object.keys(campos).forEach((k) => {
                erros[k].textContent = "";
                campos[k].removeAttribute("aria-invalid");
            });
        };

        Object.keys(campos).forEach((k) => {
            // valida ao sair do campo (se tiver algo escrito) e corrige em tempo real depois do primeiro erro
            campos[k].addEventListener("blur", () => { if (campos[k].value) validarCampo(k); });
            campos[k].addEventListener("input", () => {
                if (campos[k].getAttribute("aria-invalid") === "true") validarCampo(k);
            });
        });

        const mostrarStatus = (texto, tipo = "") => {
            status.textContent = texto;
            status.className = "contato-status" + (tipo ? ` ${tipo}` : "");
        };

        // ==================================================
        // 5. RASCUNHO AUTOMÁTICO (localStorage)
        //    O que a pessoa digitou fica guardado: se fechar a aba e voltar, está lá.
        // ==================================================
        const atualizarContador = () => {
            contador.textContent = `${campos.msg.value.length}/${campos.msg.maxLength}`;
        };

        let timerRascunho = null;
        const salvarRascunho = () => {
            const dados = { nome: campos.nome.value, email: campos.email.value, msg: campos.msg.value };
            if (!dados.nome && !dados.email && !dados.msg) {
                local.remover(CHAVES.rascunho);
                indicadorRascunho.textContent = "";
                return;
            }
            local.gravar(CHAVES.rascunho, { ...dados, salvoEm: Date.now() });
            indicadorRascunho.textContent = "Draft saved on this device";
        };

        form.addEventListener("input", () => {
            atualizarContador();
            clearTimeout(timerRascunho);
            timerRascunho = setTimeout(salvarRascunho, 300);
        });

        const restaurarRascunho = () => {
            const rascunho = local.ler(CHAVES.rascunho);
            if (!rascunho) return;
            campos.nome.value = rascunho.nome || "";
            campos.email.value = rascunho.email || "";
            campos.msg.value = rascunho.msg || "";
            atualizarContador();
            if (rascunho.nome || rascunho.email || rascunho.msg) {
                indicadorRascunho.textContent = "Draft restored from your last visit";
            }
        };

        // ==================================================
        // 6. ENVIO
        // ==================================================
        const montarMailto = ({ nome, email, msg }) => {
            const assunto = `Portfolio contact - ${nome}`;
            const corpo = `${msg}\n\n— ${nome} (${email})`;
            return `mailto:${CONTATO.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
        };

        const registrarEnvio = (dados, via) => {
            const hist = local.ler(CHAVES.historico, []);
            hist.push({ nome: dados.nome, email: dados.email, mensagem: dados.msg, data: Date.now(), via });
            local.gravar(CHAVES.historico, hist.slice(-20));
            sessao.gravar(CHAVES.enviadasSessao, sessao.ler(CHAVES.enviadasSessao, 0) + 1);
        };

        const setEnviando = (enviando) => {
            btnEnviar.disabled = enviando;
            btnEnviarTexto.textContent = enviando ? "Sending..." : "Send message";
        };

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const invalidos = Object.keys(REGRAS).filter((k) => !validarCampo(k));
            if (invalidos.length) {
                campos[invalidos[0]].focus();
                mostrarStatus("Please fix the highlighted fields.", "erro-envio");
                return;
            }

            const dados = { nome: campos.nome.value.trim(), email: campos.email.value.trim(), msg: campos.msg.value.trim() };
            mostrarStatus("");
            setEnviando(true);

            try {
                let via;
                if (CONTATO.endpoint) {
                    const resposta = await fetch(CONTATO.endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json" },
                        body: JSON.stringify({ name: dados.nome, email: dados.email, message: dados.msg })
                    });
                    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
                    via = "form";
                } else {
                    window.location.href = montarMailto(dados);
                    via = "mailto";
                }

                registrarEnvio(dados, via);

                // limpa o formulário e o rascunho (a mensagem já foi enviada)
                form.reset();
                limparErros();
                atualizarContador();
                local.remover(CHAVES.rascunho);
                indicadorRascunho.textContent = "";
                atualizarHistorico();

                mostrarStatus(
                    via === "form"
                        ? "Message sent! Thanks, I'll get back to you soon."
                        : "Your email app should open with the message ready to send.",
                    "ok"
                );
            } catch {
                mostrarStatus("Couldn't send right now. Your draft is saved — try again or use a channel above.", "erro-envio");
            } finally {
                setEnviando(false);
            }
        });

        // ==================================================
        // 7. LIMPAR DADOS SALVOS (rascunho + histórico + contador da visita)
        // ==================================================
        btnLimpar.addEventListener("click", () => {
            local.remover(CHAVES.rascunho);
            local.remover(CHAVES.historico);
            sessao.remover(CHAVES.enviadasSessao);
            form.reset();
            limparErros();
            atualizarContador();
            indicadorRascunho.textContent = "";
            atualizarHistorico();
            mostrarStatus("Saved data cleared from this device.", "ok");
        });

        // ==================================================
        // INÍCIO
        // ==================================================
        restaurarRascunho();
        atualizarHistorico();
        // se a página foi recarregada com o painel aberto nesta mesma aba, reabre
        if (sessao.ler(CHAVES.abertoSessao, false) === true) abrir(true);
    });
})();