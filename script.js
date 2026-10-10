const modelViewer = document.querySelector('model-viewer');
const painelSobre = document.querySelector('.painel-sobre');
const painelSkills = document.querySelector('.painel-skills');
const painelProjetos = document.querySelector('.painel-projetos');
const fotoInner = document.querySelector('.foto-3d-inner');

// ==================================================
// IMPEDE O BOTÃO DIREITO DE FAZER PAN
// ==================================================
modelViewer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

modelViewer.addEventListener('pointerdown', (e) => {
    if (e.button === 2) e.preventDefault();
});

modelViewer.addEventListener('pointermove', (e) => {
    if (e.buttons === 2) e.preventDefault();
});

// ==================================================
// EFEITO 3D NOS PAINÉIS E NA FOTO
// ==================================================
modelViewer.addEventListener('camera-change', () => {
    const orbit = modelViewer.getCameraOrbit();
    let cameraTheta = (orbit.theta * 180) / Math.PI;

    if (painelSobre && !painelSobre.classList.contains("expanded-mode")) {
        painelSobre.style.transform = `translate(0%, -50%) translateY(290px) rotateY(${0 - cameraTheta}deg)`;
    }
   
    if (painelSkills && !painelSkills.classList.contains("expanded-mode")) {
        painelSkills.style.transform = `translate(0%, -50%) translateY(170px) rotateY(${120 - cameraTheta}deg)`;
    }
   
    if (painelProjetos && !painelProjetos.classList.contains("expanded-mode")) {
        painelProjetos.style.transform = `translate(0%, -50%) translateY(210px) rotateY(${240 - cameraTheta}deg)`;
    }

    if (fotoInner) {
        fotoInner.style.transform = `rotateY(${0 - cameraTheta}deg)`;
    }
});

const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');

        const molduras = document.querySelectorAll('.moldura-sup, .moldura-inf');
        const fotoAbout = document.querySelector('.FotoAbout');

        if (modelViewer) {
            modelViewer.src = isDarkMode ? 'CristalVerde.glb' : 'CristalRoxo.glb';
        }

        molduras.forEach(img => {
            img.src = isDarkMode ? 'Moldura Roxa.png' : 'Moldura branco.png';
        });

        if (fotoAbout) {
            fotoAbout.src = isDarkMode ? 'Foto-AboutMeRoxa.png' : 'Foto-AboutMe.png';
        }        
    });
}

// ==================================================
// ANIMAÇÕES DE EXPANSÃO DOS PAINÉIS
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    const modelViewerElement = document.querySelector("model-viewer");
    const elementosFundo = document.querySelectorAll(".introducao, .Know");
    const fotoCristal = document.querySelector(".foto-cristal-expandida"); 
    
    const painelSobreAnim = document.querySelector(".painel-sobre");
    const painelSkillsAnim = document.querySelector(".painel-skills");
    const painelProjetosAnim = document.querySelector(".painel-projetos");

    // ==================================================
    // 1. LÓGICA DO PAINEL ABOUT ME
    //    Tudo acontece dentro de UMA timeline (sem trocar layout via classe CSS),
    //    então o reverse() devolve cada elemento exatamente ao lugar de origem.
    // ==================================================
    const btnExpandir = document.querySelector(".btn-expandir");
    const fotoPainelAntiga = document.querySelector(".foto-wrapper");
    const textoCurto = document.querySelector(".texto-curto");
    const textoCompleto = document.querySelector(".texto-completo");
    const tituloSobre = painelSobreAnim.querySelector("h3");

    let sobreExpandido = false;
    let sobreBusy = false;
    let tl;

    // Cristal flutuando enquanto o About me está aberto (a foto no cristal acompanha, pois é um hotspot dele)
    let floatCristal = null;
    const iniciarFlutuacaoCristal = () => {
        floatCristal = gsap.to(modelViewerElement, {
            y: -14,
            duration: 2.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
    };
    const pararFlutuacaoCristal = (aoTerminar) => {
        if (floatCristal) { floatCristal.kill(); floatCristal = null; }
        gsap.to(modelViewerElement, { y: 0, duration: 0.35, ease: "power2.out", onComplete: aoTerminar });
    };

    if (btnExpandir) {
        btnExpandir.addEventListener("click", () => {
            if (sobreBusy) return;

            if (!sobreExpandido) {
                // === IDA (EXPANDIR) ===
                sobreBusy = true;
                modelViewerElement.removeAttribute('camera-controls');

                const rect = painelSobreAnim.getBoundingClientRect();
                painelSobreAnim.removeAttribute("slot");
                document.body.appendChild(painelSobreAnim);

                gsap.set(painelSobreAnim, {
                    position: "fixed",
                    left: rect.left + "px",
                    top: rect.top + "px",
                    width: rect.width + "px",
                    height: rect.height + "px",
                    transform: "none",
                    margin: 0,
                    zIndex: 100
                });

                // A classe serve só de "marcador" para o camera-change não sobrescrever o transform
                painelSobreAnim.classList.add("expanded-mode");

                // ---- Medidas do estado final (largura do painel = 44vw, borda 6px*2, padding 40px*2)
                const W = window.innerWidth;
                const larguraTexto = W * 0.44 - 12 - 80;

                // Título centralizado: quanto ele precisa andar para ficar no meio
                const range = document.createRange();
                range.selectNodeContents(tituloSobre);
                const xTitulo = Math.max(0, (larguraTexto - range.getBoundingClientRect().width) / 2);

                // Altura que o texto completo vai ocupar na largura final (medido num clone invisível)
                const clone = textoCompleto.cloneNode(true);
                clone.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;opacity:1;height:auto;overflow:visible;margin:0;";
                clone.style.setProperty("width", larguraTexto + "px", "important");
                painelSobreAnim.appendChild(clone);
                const alturaCompleto = clone.offsetHeight;
                clone.remove();

                gsap.set(textoCurto, { overflow: "hidden" });

                tl = gsap.timeline({
                    defaults: { ease: "expo.inOut", duration: 1.6 },
                    onComplete: () => { sobreBusy = false; iniciarFlutuacaoCristal(); },
                    onReverseComplete: () => {
                        modelViewerElement.setAttribute('camera-controls', '');
                        painelSobreAnim.classList.remove("expanded-mode");

                        modelViewerElement.appendChild(painelSobreAnim);
                        painelSobreAnim.setAttribute("slot", "hotspot-sobre");

                        // Limpa tudo que o GSAP injetou: o CSS original volta a mandar no layout
                        gsap.set([painelSobreAnim, tituloSobre, textoCurto, textoCompleto, fotoPainelAntiga,
                                  fotoCristal, modelViewerElement, painelSkillsAnim, painelProjetosAnim,
                                  elementosFundo, btnExpandir], { clearProps: "all" });

                        const orbit = modelViewerElement.getCameraOrbit();
                        const cameraTheta = (orbit.theta * 180) / Math.PI;
                        painelSobreAnim.style.transform = `translate(0%, -50%) translateY(290px) rotateY(${0 - cameraTheta}deg)`;

                        sobreExpandido = false;
                        sobreBusy = false;
                    }
                });

                // Some o resto da página
                tl.to([elementosFundo, painelSkillsAnim, painelProjetosAnim], {
                    autoAlpha: 0, duration: 0.5, pointerEvents: "none"
                }, 0);

                // Cristal: desloca e dá a volta completa
                tl.to(modelViewerElement, { x: "20vw" }, 0);

                const orbit = modelViewerElement.getCameraOrbit();
                const currentThetaDeg = (orbit.theta * 180) / Math.PI;
                const cam = { angulo: currentThetaDeg };

                tl.to(cam, {
                    angulo: currentThetaDeg + 360,
                    onUpdate: () => {
                        modelViewerElement.setAttribute("camera-orbit", `${cam.angulo}deg 90deg auto`);
                    }
                }, 0);

                // Foto grande no cristal
                tl.fromTo(fotoCristal,
                    { autoAlpha: 0, scale: 0.7 },
                    { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" },
                    0.4
                );

                // Painel cresce e vai para a esquerda (padding também anima, sem "pulo")
                tl.to(painelSobreAnim, {
                    left: "14vw",
                    top: "50%",
                    yPercent: -50,
                    width: "44vw",
                    height: "82vh",
                    paddingTop: 48,
                    paddingLeft: 40,
                    paddingRight: 40
                }, 0);

                // Foto pequena do painel: some e libera o espaço
                tl.to(fotoPainelAntiga, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 0)
                  .to(fotoPainelAntiga, { height: 0, duration: 1.2 }, 0.1);

                // Título desliza para o centro
                tl.to(tituloSobre, { x: xTitulo, marginBottom: 16, duration: 1.4 }, 0);

                // Texto curto sai, texto completo entra (os dois no mesmo lugar, trocando de altura)
                tl.to(textoCurto, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, 0.1)
                  .to(textoCurto, { height: 0, marginBottom: 0, duration: 1.0 }, 0.2);

                tl.fromTo(textoCompleto,
                    { height: 0, marginTop: 0 },
                    { height: alturaCompleto, marginTop: 10, duration: 1.2 },
                    0.3
                );
                tl.fromTo(textoCompleto,
                    { autoAlpha: 0 },
                    { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
                    0.9
                );

                gsap.to(btnExpandir, { opacity: 0, duration: 0.3, delay: 0.5, onComplete: () => {
                    btnExpandir.textContent = "Click to come back";
                    gsap.to(btnExpandir, { opacity: 1, duration: 0.3 });
                }});

                sobreExpandido = true;
            } else {
                // === VOLTA (RECOLHER) ===
                // Só trocamos o texto do botão: a timeline inteira roda ao contrário
                // e cada coisa volta sozinha para o lugar certo.
                sobreBusy = true;

                gsap.to(btnExpandir, { opacity: 0, duration: 0.2, onComplete: () => {
                    btnExpandir.textContent = "Click to expand";
                    gsap.to(btnExpandir, { opacity: 1, duration: 0.3 });
                }});

                // Para a flutuação suavemente e, só então, tudo volta para o lugar
                pararFlutuacaoCristal(() => tl.timeScale(1.15).reverse());
            }
        });
    }

    // ==================================================
    // 2. ANIMAÇÃO DE SKILLS
    //    O painel vai pro centro, a pasta abre, saem raízes de dentro dela
    //    e cada raiz termina numa subpasta. Tudo numa timeline só:
    //    o reverse() recolhe subpastas -> raízes -> pasta -> painel.
    // ==================================================
    const btnSkills = document.querySelector('.btn-expandir-skills');
    const skillsContainer = document.querySelector('.skills-expanded-container');
    const skillsSvg = document.getElementById('skillsSvg');
    const SVG_NS = "http://www.w3.org/2000/svg";

    let isSkillsExpanded = false;
    let skillsBusy = false;
    let tlSkills;
    let arvoreSkills = [];

    // Subpasta fiel ao Figma (174 x 139, centrada em 0,0): aba com curva suave, verso mais escuro aparecendo à direita
    // Descobre os arquivos da moldura das pastas (clara e roxa) testando as extensões mais comuns
    let molduraPastaSrc = "MolduraPastas.png";
    let molduraPastaRoxaSrc = "MolduraPastasRoxa.png";
    const srcMoldura = () => document.body.classList.contains('dark-mode') ? molduraPastaRoxaSrc : molduraPastaSrc;
    const atualizarMolduras = () => document.querySelectorAll('.moldura-pasta').forEach(el => el.setAttribute('href', srcMoldura()));

    const resolverMoldura = async (base) => {
        for (const ext of ["png", "webp", "svg", "jpg", "jpeg", "PNG"]) {
            const nome = `${base}.${ext}`;
            const ok = await new Promise(res => {
                const im = new Image();
                im.onload = () => res(true);
                im.onerror = () => res(false);
                im.src = nome;
            });
            if (ok) return nome;
        }
        console.warn(`Moldura não encontrada: ${base} (confira o nome e a extensão do arquivo)`);
        return null;
    };

    (async () => {
        molduraPastaSrc = (await resolverMoldura("MolduraPastas")) || molduraPastaSrc;
        molduraPastaRoxaSrc = (await resolverMoldura("MolduraPastasRoxa")) || molduraPastaRoxaSrc;
        atualizarMolduras();
    })();

    // Troca a moldura junto com o tema
    const botaoTema = document.getElementById('themeToggle');
    if (botaoTema) botaoTema.addEventListener('click', atualizarMolduras);

    const PASTA_TRAS = "M -30 -54 L 75 -54 Q 87 -54 87 -42 L 87 57 Q 87 69 75 69 L -30 69 Z";
    const PASTA_FRENTE = "M -87 -58 Q -87 -70 -75 -70 L -30 -70 Q -20 -70 -15 -62 L -10 -53 Q -5 -40 8 -40 L 75 -40 Q 87 -40 87 -28 L 87 57 Q 87 69 75 69 L -75 69 Q -87 69 -87 57 Z";

    // ---- Cards das skills que saem de dentro de cada subpasta ----
    // Cada card é desenhado centrado em (0,0), com 66 x 72 de tamanho.
    // Se existir icons/<nome>.svg, o card usa esse arquivo; senão usa o desenho de reserva abaixo.
    // Nomes esperados (os mesmos do site devicon.dev): html5, css3, javascript, mysql, csharp,
    // photoshop, figma, blender, aftereffects.
    const ICONES_ARQUIVO = { html: "html5", css: "css3", js: "javascript", sql: "mysql", cs: "csharp",
                             ps: "photoshop", fig: "figma", blend: "blender", ae: "aftereffects" };
    const iconesDisponiveis = {};
    Object.entries(ICONES_ARQUIVO).forEach(([chave, nome]) => {
        const im = new Image();
        im.onload = () => { iconesDisponiveis[chave] = `icons/${nome}.svg`; };
        im.src = `icons/${nome}.svg`;
    });
    const SKILLS = {
        html: { nome: "HTML", ext: ".html", icone: `<path d="M -11 -13 L 11 -13 L 9 11 L 0 14 L -9 11 Z" class="sk-ic"/><text x="0" y="5" text-anchor="middle" class="sk-icone-txt" font-size="15">5</text>` },
        css:  { nome: "CSS", ext: ".css", icone: `<path d="M -11 -13 L 11 -13 L 9 11 L 0 14 L -9 11 Z" class="sk-ic"/><text x="0" y="5" text-anchor="middle" class="sk-icone-txt" font-size="15">3</text>` },
        js:   { nome: "JavaScript", ext: ".js", icone: `<rect x="-12" y="-12" width="24" height="24" rx="2" class="sk-ic"/><text x="10" y="10" text-anchor="end" class="sk-icone-txt" font-size="13">JS</text>` },
        sql:  { nome: "MySQL", ext: ".sql", icone: `<g fill="none" class="sk-ic-st" stroke-width="2"><ellipse cx="0" cy="-8" rx="10" ry="4"/><path d="M -10 -8 V 8 C -10 13 10 13 10 8 V -8"/><path d="M -10 0 C -10 5 10 5 10 0"/></g>` },
        cs:   { nome: "C#", ext: ".cs", icone: `<path d="M 0 -14 L 12 -7 L 12 7 L 0 14 L -12 7 L -12 -7 Z" class="sk-ic"/><text x="0" y="5" text-anchor="middle" class="sk-icone-txt" font-size="13">C#</text>` },
        ps:   { nome: "Photoshop", ext: ".psd", icone: `<rect x="-12" y="-12" width="24" height="24" rx="5" class="sk-ic"/><text x="0" y="5" text-anchor="middle" class="sk-icone-txt" font-size="14">Ps</text>` },
        ae:   { nome: "After Effects", ext: ".aep", icone: `<rect x="-12" y="-12" width="24" height="24" rx="5" class="sk-ic"/><text x="0" y="5" text-anchor="middle" class="sk-icone-txt" font-size="14">Ae</text>` },
        fig:  { nome: "Figma", ext: ".fig", icone: `<g class="sk-ic"><rect x="-8" y="-14" width="8" height="9" rx="4"/><rect x="0" y="-14" width="8" height="9" rx="4"/><rect x="-8" y="-4.5" width="8" height="9" rx="4"/><circle cx="4" cy="0" r="4.5"/><rect x="-8" y="5" width="8" height="9" rx="4"/></g>` },
        blend:{ nome: "Blender", ext: ".blend", icone: `<g fill="none" class="sk-ic-st" stroke-width="3.2"><circle cx="3" cy="3" r="9"/></g><circle cx="3" cy="3" r="3.6" class="sk-ic"/><path d="M -13 -1 L 0 -11 L 11 -11 L 4 -4 L -7 -4 Z" class="sk-ic"/>` },
    };

    // Monta o leque de cards atrás da frente da pasta e devolve as posições finais de cada um
    // Cada card tem 86 x 100 (centrado em 0,0)
    const montarCardsSkills = (grupo, chaves) => {
        const n = chaves.length;
        const espaco = 92;
        return chaves.map((chave, i) => {
            const s = SKILLS[chave];
            const off = i - (n - 1) / 2;
            const el = criarEl("g", { class: "sk-card" });
            const arquivo = iconesDisponiveis[chave];
            const icone = arquivo
                ? `<image href="${arquivo}" x="-20" y="-38" width="40" height="40" preserveAspectRatio="xMidYMid meet"/>`
                : `<g transform="translate(0 -17) scale(1.45)">${s.icone}</g>`;
            el.innerHTML = `<rect class="sk-card-bg" x="-43" y="-50" width="86" height="100" rx="13"/>`
                + icone
                + `<text class="sk-nome" x="0" y="24" text-anchor="middle">${s.nome}</text>`
                + `<rect class="sk-badge" x="-23" y="31" width="46" height="15" rx="5"/>`
                + `<text class="sk-ext" x="0" y="42" text-anchor="middle">${s.ext}</text>`;
            grupo.appendChild(el);

            const alvo = { x: off * espaco, y: -112 + off * off * 8, rot: off * 8 };
            gsap.set(el, { x: 0, y: 10, scale: 0.4, rotation: 0, autoAlpha: 0, svgOrigin: "0 0" });
            return { el, alvo };
        });
    };

    const criarEl = (tag, attrs = {}) => {
        const el = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    };

    // ---- Ajudantes de curva ----
    // ponto de uma curva de Bézier cúbica
    const bz = (a, b, c, d, t) => {
        const v = 1 - t;
        return {
            x: v * v * v * a.x + 3 * v * v * t * b.x + 3 * v * t * t * c.x + t * t * t * d.x,
            y: v * v * v * a.y + 3 * v * v * t * b.y + 3 * v * t * t * c.y + t * t * t * d.y
        };
    };
    // pontos da curva "empurrados" para os lados, alternando (cria as ondas da raiz)
    const ondas = (a, b, c, d, ts, amp, sinal) => ts.map((t, j) => {
        const p = bz(a, b, c, d, t);
        const q = bz(a, b, c, d, Math.min(1, t + 0.01));
        const o = bz(a, b, c, d, Math.max(0, t - 0.01));
        let tx = q.x - o.x, ty = q.y - o.y;
        const m = Math.hypot(tx, ty) || 1;
        const off = amp * sinal * (j % 2 ? -1 : 1) * (1 - 0.35 * t);
        return { x: p.x + (-ty / m) * off, y: p.y + (tx / m) * off };
    });
    // curva suave passando por todos os pontos (Catmull-Rom -> Bézier)
    const curvaSuave = (pts) => {
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
            d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
        }
        return d;
    };

    // Monta raízes + subpastas na medida da tela atual (em pixels).
    // fc = centro e escala da pasta do painel na tela (painel parado onde está)
    // pc = centro do painel na tela
    const montarArvoreSkills = (fc, pc) => {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const k = Math.max(0.6, Math.min(1.15, Math.min(H / 800, W / 1150))); // escala das subpastas e detalhes

        skillsSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        skillsSvg.innerHTML = "";

        // Máscara com o formato da frente da pasta aberta: as raízes passam POR TRÁS dela,
        // então parecem sair de dentro da pasta.
        const defs = criarEl("defs");
        const mascara = criarEl("mask", { id: "mascaraPastaSkills", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H });
        mascara.append(
            criarEl("rect", { x: 0, y: 0, width: W, height: H, fill: "#fff" }),
            criarEl("path", {
                d: PASTA_FRENTE,
                fill: "#000",
                transform: `translate(${fc.x} ${fc.y + 69 * fc.sc}) scale(${fc.sc} ${fc.sc * 0.86}) translate(0 -69)`
            })
        );
        defs.appendChild(mascara);

        const gRaizes = criarEl("g", { mask: "url(#mascaraPastaSkills)" });
        const gPastas = criarEl("g");
        const gTopo = criarEl("g"); // raízes que passam POR CIMA da pasta (sem máscara)
        skillsSvg.append(defs, gRaizes, gTopo, gPastas);

        const topoFrente = fc.y + (69 - 109 * 0.86) * fc.sc; // borda de cima da frente da pasta aberta

        const limX = (v) => Math.max(95 * k, Math.min(W - 95 * k, v));
        const limY = (v) => Math.max(75 * k, Math.min(H - 75 * k, v));

        // Posição das subpastas (como no rascunho do Paint), medida a partir do painel
        // lado: 1 = raiz chega pela direita da subpasta, -1 = pela esquerda
        const itens = [
            { label: "Programming", skills: ["js", "sql", "cs"], fx: limX(pc.x - W * 0.31), fy: limY(pc.y - H * 0.19), sx: -16, lado:  1, arco: 0.06 },
            { label: "Web", skills: ["html", "css"], fx: limX(pc.x - W * 0.31), fy: limY(pc.y + H * 0.24), sx:  -2, lado:  1, arco: 0.09, sobre: true },
            { label: "Design", skills: ["ps", "fig", "blend", "ae"], fx: limX(pc.x + W * 0.28), fy: limY(pc.y + H * 0.025), sx:   8, lado: -1, arco: 0.10, sobre: true }
        ];

        const medir = (d) => {
            const p = criarEl("path", { d, fill: "none", stroke: "none" });
            gRaizes.appendChild(p);
            const r = { el: p, len: p.getTotalLength() };
            return r;
        };

        return itens.map((it, i) => {
            const S = { x: fc.x + it.sx * fc.sc, y: topoFrente + 16 * fc.sc };       // dentro da pasta (escondido pela máscara)
            const E = { x: it.fx + it.lado * 87 * k, y: it.fy + 20 * k };           // borda da subpasta
            const dx = E.x - S.x;
            const c1 = { x: S.x + dx * 0.18, y: S.y - H * it.arco };                 // sobe primeiro...
            const c2 = { x: E.x - dx * 0.40, y: E.y };                               // ...e chega na subpasta na horizontal
            const amp = H * 0.022;                                  // altura das ondas
            const fim = { x: E.x + it.lado * 50 * k, y: E.y };      // chega na subpasta na horizontal
            let dCurva;
            let A = null;

            if (it.sobre) {
                // Raiz "por cima": nasce por trás da frente, sobe acima da borda e desce passando
                // POR CIMA da frente da pasta antes de seguir, ondulando, para a subpasta.
                const u = fc.sc;
                const dir = -it.lado;                                        // +1 = sai pela direita, -1 = pela esquerda
                const topoAba = fc.y + (69 - 139 * 0.86) * u;                // topo da aba da pasta aberta
                let B;
                if (dir > 0) {
                    A = { x: fc.x + 34 * u, y: topoFrente - 24 * u };        // ponto mais alto (ainda atrás da frente)
                    B = { x: fc.x + 80 * u, y: topoFrente + 14 * u };        // já em cima da frente
                } else {
                    A = { x: fc.x - 44 * u, y: topoAba - 22 * u };           // acima da aba
                    B = { x: fc.x - 66 * u, y: topoAba + 28 * u };           // em cima da aba/frente
                }
                const tB = { x: 0.6 * dir, y: 0.8 };
                const dxE = E.x - B.x;
                const meio = ondas(B, { x: B.x + tB.x * 26 * u, y: B.y + tB.y * 26 * u }, { x: E.x - dxE * 0.4, y: E.y }, E,
                                   [0.40, 0.75], amp * 0.8, 1);
                dCurva = curvaSuave([S, A, B, ...meio, fim, E]);
            } else {
                const meio = ondas(S, c1, c2, E, [0.30, 0.65], amp, it.lado);
                dCurva = curvaSuave([S, ...meio, fim, E]);
            }

            const ref = medir(dCurva);
            const len = ref.len;

            // pontos + normais ao longo da curva
            const amostrar = (n) => {
                const pts = [];
                for (let j = 0; j <= n; j++) {
                    const p = ref.el.getPointAtLength(len * j / n);
                    const q = ref.el.getPointAtLength(Math.min(len, len * j / n + 1.5));
                    const o = ref.el.getPointAtLength(Math.max(0, len * j / n - 1.5));
                    let tx = q.x - o.x, ty = q.y - o.y;
                    const m = Math.hypot(tx, ty) || 1;
                    tx /= m; ty /= m;
                    pts.push({ x: p.x, y: p.y, tx, ty, nx: -ty, ny: tx, t: j / n });
                }
                return pts;
            };

            // Raiz principal: fita que afina da base até a ponta
            const n1 = Math.max(40, Math.round(len / 8));
            const pts = amostrar(n1);
            const larg = (t) => (4.8 - 3.2 * t) * Math.max(0.85, k);

            // Fio fino que serpenteia em volta da raiz (dá o ar de trepadeira)
            const n2 = Math.max(80, Math.round(len / 4));
            const ciclo = 110 * k;
            const ptsFio = amostrar(n2).map(p => {
                const o = 5.5 * k * Math.sin((p.t * len / ciclo) * Math.PI * 2) * (1 - 0.55 * p.t);
                return { x: p.x + p.nx * o, y: p.y + p.ny * o };
            });

            const fita = criarEl("path", { class: "raiz-fita" });
            const fio = criarEl("path", { class: "raiz-fio" });
            gRaizes.append(fita, fio);

            let fitaTopo = null, fioTopo = null;
            if (A) {
                // cópia sem máscara de pasta, recortada só da parte depois do ponto mais alto: fica NA FRENTE da pasta
                const idClip = `clipSobre${i}`;
                const clip = criarEl("clipPath", { id: idClip });
                const cx0 = it.lado === -1 ? A.x : 0;
                const cw = it.lado === -1 ? Math.max(0, W - A.x) : Math.max(0, A.x);
                clip.appendChild(criarEl("rect", { x: cx0, y: 0, width: cw, height: H }));
                defs.appendChild(clip);

                const gClip = criarEl("g", { "clip-path": `url(#${idClip})` });
                fitaTopo = criarEl("path", { class: "raiz-fita" });
                fioTopo = criarEl("path", { class: "raiz-fio" });
                gClip.append(fitaTopo, fioTopo);
                gTopo.appendChild(gClip);
            }

            // ---- A raiz CRESCE: a cada frame redesenhamos só o pedaço já "nascido" (sem máscaras pesadas) ----
            const fmt = (v) => v.toFixed(1);
            const lerp = (a, b, f) => a + (b - a) * f;
            const suave = (v) => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
            const setD = (d) => {
                fita.setAttribute("d", d.fita);
                fio.setAttribute("d", d.fio);
                if (fitaTopo) { fitaTopo.setAttribute("d", d.fita); fioTopo.setAttribute("d", d.fio); }
            };

            const desenhar = (p) => {
                p = Math.max(0, Math.min(1, p));
                if (p < 0.002) { setD({ fita: "", fio: "" }); return; }

                // --- fita: ponta fininha que engrossa conforme a raiz avança ---
                const pos = p * n1;
                const i1 = Math.min(n1 - 1, Math.floor(pos));
                const f1 = pos - i1;
                const tip = 0.16 * (1 - p);
                const Lado = [], Outro = [];
                const add = (x, y, nx, ny, t) => {
                    const w = larg(t) * (tip < 0.0005 ? 1 : suave((p - t) / tip));
                    Lado.push(`${fmt(x + nx * w)} ${fmt(y + ny * w)}`);
                    Outro.push(`${fmt(x - nx * w)} ${fmt(y - ny * w)}`);
                };
                for (let j = 0; j <= i1; j++) { const q = pts[j]; add(q.x, q.y, q.nx, q.ny, q.t); }
                if (f1 > 0.001 || p >= 1) {
                    const a = pts[i1], b = pts[Math.min(n1, i1 + 1)];
                    add(lerp(a.x, b.x, f1), lerp(a.y, b.y, f1), lerp(a.nx, b.nx, f1), lerp(a.ny, b.ny, f1), p);
                }
                const dFita = Lado.length > 1 ? `M ${Lado.join(" L ")} L ${Outro.reverse().join(" L ")} Z` : "";

                // --- fio: vem um pouquinho atrás da ponta ---
                const pf = Math.max(0, (p - 0.1) / 0.9);
                let dFio = "";
                if (pf > 0.002) {
                    const pos2 = pf * n2;
                    const i2 = Math.min(n2 - 1, Math.floor(pos2));
                    const f2 = pos2 - i2;
                    const arr = [];
                    for (let j = 0; j <= i2; j++) arr.push(`${fmt(ptsFio[j].x)} ${fmt(ptsFio[j].y)}`);
                    if (f2 > 0.001 || pf >= 1) {
                        const a = ptsFio[i2], b = ptsFio[Math.min(n2, i2 + 1)];
                        arr.push(`${fmt(lerp(a.x, b.x, f2))} ${fmt(lerp(a.y, b.y, f2))}`);
                    }
                    if (arr.length > 1) dFio = "M " + arr.join(" L ");
                }

                setD({ fita: dFita, fio: dFio });
            };
            desenhar(0);

            // Subpasta (nasce com escala 0 e cresce na ponta da raiz)
            const pasta = criarEl("g", { class: "sub-folder" });
            pasta.innerHTML = `<path class="sf-back" d="${PASTA_TRAS}"/><g class="sf-cards"></g><path class="sf-front" d="${PASTA_FRENTE}"/><image class="moldura-pasta" href="${srcMoldura()}" x="-105" y="-35" width="109" height="109" preserveAspectRatio="xMinYMin meet" transform="translate(0 57) scale(1 -1)"/><text x="76" y="55" text-anchor="end">${it.label}</text>`;
            gPastas.appendChild(pasta);

            const cards = montarCardsSkills(pasta.querySelector('.sf-cards'), it.skills);
            const frente = pasta.querySelector('.sf-front');

            const estado = { s: 0, r: -8 };
            const aplicar = () => pasta.setAttribute("transform", `translate(${it.fx} ${it.fy}) rotate(${estado.r}) scale(${estado.s * k})`);
            aplicar();

            // A subpasta é clicável (o container é pointer-events: none, então liberamos só nela)
            pasta.style.pointerEvents = "auto";
            pasta.style.cursor = "pointer";

            return { prog: { p: 0 }, desenhar, estado, aplicar, cards, frente, pasta, aberta: false, tlAbrir: null };
        });
    };

    const tituloSkills = painelSkillsAnim.querySelector('h3');

    if (btnSkills) {
        btnSkills.addEventListener('click', () => {
            if (skillsBusy) return;

            if (!isSkillsExpanded) {
                // === IDA (EXPANDIR) ===
                skillsBusy = true;
                modelViewerElement.removeAttribute('camera-controls');

                const rect = painelSkillsAnim.getBoundingClientRect();
                const layoutW = painelSkillsAnim.offsetWidth;
                const layoutH = painelSkillsAnim.offsetHeight;
                painelSkillsAnim.removeAttribute("slot");
                document.body.appendChild(painelSkillsAnim);

                // O painel NÃO sai do lugar: só "endireita" (para de girar em 3D) no mesmo centro.
                const boxFinal = {
                    left: rect.left + rect.width / 2 - layoutW / 2,
                    top: rect.top + rect.height / 2 - layoutH / 2,
                    width: layoutW,
                    height: layoutH
                };

                // 1º: painel reto no tamanho final, só para medir onde fica a pasta
                gsap.set(painelSkillsAnim, {
                    position: "fixed",
                    left: boxFinal.left + "px",
                    top: boxFinal.top + "px",
                    width: boxFinal.width + "px",
                    height: boxFinal.height + "px",
                    transform: "none",
                    margin: 0,
                    zIndex: 100
                });
                const pr = painelSkillsAnim.getBoundingClientRect();
                const sr = painelSkillsAnim.querySelector('.PastaSkills-SVG').getBoundingClientRect();
                const fc = { x: sr.left + sr.width / 2, y: sr.top + sr.height / 2, sc: sr.width / 220 };
                const pc = { x: pr.left + pr.width / 2, y: pr.top + pr.height / 2 };

                // 2º: volta ao tamanho de partida (o do painel girando) para não dar "pulo"
                gsap.set(painelSkillsAnim, {
                    left: rect.left + "px", top: rect.top + "px",
                    width: rect.width + "px", height: rect.height + "px"
                });

                painelSkillsAnim.classList.add("expanded-mode");

                const arvore = montarArvoreSkills(fc, pc);
                arvoreSkills = arvore;
                skillsContainer.style.display = "block";

                tlSkills = gsap.timeline({
                    defaults: { ease: "expo.inOut", duration: 1.5 },
                    onComplete: () => { skillsBusy = false; },
                    onReverseComplete: () => {
                        modelViewerElement.setAttribute('camera-controls', '');
                        painelSkillsAnim.classList.remove("expanded-mode");

                        modelViewerElement.appendChild(painelSkillsAnim);
                        painelSkillsAnim.setAttribute("slot", "hotspot-skills");

                        gsap.set([painelSkillsAnim, modelViewerElement, elementosFundo, painelSobreAnim,
                                  painelProjetosAnim, fotoCristal, tituloSkills, btnSkills], { clearProps: "all" });
                        gsap.set([".pasta-main-front", ".pasta-papel"], { clearProps: "all" });

                        const orbit = modelViewerElement.getCameraOrbit();
                        const cameraTheta = (orbit.theta * 180) / Math.PI;
                        painelSkillsAnim.style.transform = `translate(0%, -50%) translateY(170px) rotateY(${120 - cameraTheta}deg)`;

                        skillsContainer.style.display = "none";
                        skillsSvg.innerHTML = "";

                        isSkillsExpanded = false;
                        skillsBusy = false;
                    }
                });

                // Some o resto da página
                tlSkills.to([elementosFundo, painelSobreAnim, painelProjetosAnim, fotoCristal], {
                    autoAlpha: 0, duration: 0.5, pointerEvents: "none"
                }, 0);

                // Painel só se ajeita no lugar onde já está (sem andar pela tela)
                tlSkills.to(painelSkillsAnim, {
                    left: boxFinal.left + "px",
                    top: boxFinal.top + "px",
                    width: boxFinal.width + "px",
                    height: boxFinal.height + "px",
                    duration: 0.8,
                    ease: "power2.out"
                }, 0);

                // Pasta do meio abre: frente baixa um pouco e o papel sobe
                tlSkills.to(".pasta-main-front", { scaleY: 0.86, transformOrigin: "50% 100%", duration: 0.6, ease: "power2.out" }, 1.0)
                        .to(".pasta-papel", { autoAlpha: 1, y: -26, duration: 0.6, ease: "back.out(1.5)" }, 1.05);

                // Raízes saem de dentro da pasta e cada uma termina numa subpasta
                const T0 = 1.45;
                const DUR = 2.3;
                arvore.forEach((a, i) => {
                    const ini = T0 + i * 0.22;

                    // a raiz cresce da pasta até a subpasta (fita + fio, desenhados juntos a cada frame)
                    tlSkills.to(a.prog, {
                        p: 1,
                        duration: DUR,
                        ease: "power1.inOut",
                        onUpdate: () => a.desenhar(a.prog.p)
                    }, ini);

                    tlSkills.to(a.estado, {
                        s: 1, r: 0, duration: 1.0, ease: "back.out(1.5)",
                        onUpdate: a.aplicar
                    }, ini + DUR * 0.78);

                    // Ao CLICAR na subpasta: a frente baixa e os cards saem em leque (clique de novo para fechar)
                    a.tlAbrir = gsap.timeline({ paused: true });
                    a.tlAbrir.to(a.frente, { scaleY: 0.86, transformOrigin: "50% 100%", duration: 0.5, ease: "power2.out" }, 0);

                    a.cards.forEach((c, j) => {
                        a.tlAbrir.to(c.el, {
                            x: c.alvo.x,
                            y: c.alvo.y,
                            rotation: c.alvo.rot,
                            scale: 1,
                            duration: 0.8,
                            ease: "back.out(1.4)"
                        }, 0.1 + j * 0.08);
                        a.tlAbrir.to(c.el, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 0.1 + j * 0.08);
                    });

                    a.pasta.addEventListener('click', () => {
                        if (skillsBusy) return;
                        if (!a.aberta) {
                            a.aberta = true;
                            a.tlAbrir.timeScale(1).play();
                        } else {
                            a.aberta = false;
                            a.tlAbrir.timeScale(1.4).reverse();
                        }
                    });
                });

                // Texto do botão
                gsap.to(btnSkills, { opacity: 0, duration: 0.3, onComplete: () => {
                    btnSkills.textContent = "Click to come back";
                    gsap.to(btnSkills, { opacity: 1, duration: 0.3 });
                }});

                isSkillsExpanded = true;
            } else {
                // === VOLTA (RECOLHER) ===
                skillsBusy = true;

                gsap.to(btnSkills, { opacity: 0, duration: 0.2, onComplete: () => {
                    btnSkills.textContent = "Click to expand";
                    gsap.to(btnSkills, { opacity: 1, duration: 0.3 });
                }});

                // Fecha as subpastas que estiverem abertas e só depois recolhe a árvore
                const abertas = arvoreSkills.filter(a => a.aberta);
                abertas.forEach(a => { a.aberta = false; a.tlAbrir.timeScale(1.6).reverse(); });
                gsap.delayedCall(abertas.length ? 0.55 : 0, () => tlSkills.timeScale(1.15).reverse());
            }
        });
    }

    // ==================================================
    // 3. ANIMAÇÃO DE PROJECTS
    //    Os cards grandes nascem EXATAMENTE em cima dos mini-cards do painel
    //    (mesma posição e tamanho) e voam para fora: nada some, nada novo surge.
    // ==================================================
    const btnProjetos = document.querySelector('.btn-expandir-projetos');
    const miniGrid = document.querySelector('.mini-projects-grid');
    const githubBtn = document.querySelector('.github-repo-btn');
    const projetosContainer = document.querySelector('.projetos-expanded-container');
    const projectCards = document.querySelectorAll('.proj-card-wrapper');
    const projectInners = document.querySelectorAll('.proj-card-inner');
    const projectDescs = document.querySelectorAll('.proj-desc');
    const linhaDeco = painelProjetosAnim.querySelector('.linha-decorativa');

    let isProjetosExpanded = false;
    let projetosBusy = false;
    let tlProjetos;
    let floatTweens = [];

    // Posições finais medidas no Figma (fração da largura/altura da tela, a partir do centro)
    const posicoesProjetos = [
        { x: -0.310, y: -0.250, rot: -7 }, // top-left
        { x:  0.310, y: -0.240, rot:  6 }, // top-right
        { x: -0.300, y:  0.260, rot: -4 }, // bottom-left
        { x:  0.310, y:  0.250, rot:  4 }  // bottom-right
    ];

    const iniciarFlutuacao = () => {
        floatTweens = Array.from(projectInners).map((el, i) =>
            gsap.to(el, {
                y: -12,
                duration: 2.4 + i * 0.35,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: i * 0.25
            })
        );
    };

    if (btnProjetos) {
        btnProjetos.addEventListener('click', () => {
            if (projetosBusy) return;

            if (!isProjetosExpanded) {
                // === IDA (EXPANDIR) ===
                projetosBusy = true;
                modelViewerElement.removeAttribute('camera-controls');

                const rect = painelProjetosAnim.getBoundingClientRect();
                painelProjetosAnim.removeAttribute("slot");
                document.body.appendChild(painelProjetosAnim);

                gsap.set(painelProjetosAnim, {
                    position: "fixed",
                    left: rect.left + "px",
                    top: rect.top + "px",
                    width: rect.width + "px",
                    height: rect.height + "px",
                    transform: "none",
                    margin: 0,
                    zIndex: 100
                });

                painelProjetosAnim.classList.add("expanded-mode");
                projetosContainer.style.display = "block";

                const W = window.innerWidth;
                const H = window.innerHeight;

                // Medimos onde estão os mini-cards AGORA (painel já em posição fixa/plana)
                const minis = Array.from(miniGrid.querySelectorAll('.mini-proj')).map(m => {
                    const r = m.getBoundingClientRect();
                    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width };
                });

                gsap.set(elementosFundo, { transition: "none" });
                gsap.set(projectCards, { xPercent: -50, yPercent: -50, transformOrigin: "center center", autoAlpha: 1 });
                gsap.set(projectDescs, { autoAlpha: 0 });

                tlProjetos = gsap.timeline({
                    defaults: { ease: "expo.inOut", duration: 1.4 },
                    onComplete: () => { projetosBusy = false; iniciarFlutuacao(); },
                    onReverseComplete: () => {
                        modelViewerElement.setAttribute('camera-controls', '');
                        painelProjetosAnim.classList.remove("expanded-mode");

                        modelViewerElement.appendChild(painelProjetosAnim);
                        painelProjetosAnim.setAttribute("slot", "hotspot-projetos");

                        gsap.set([painelProjetosAnim, modelViewerElement, painelSobreAnim, painelSkillsAnim,
                                  miniGrid, linhaDeco, elementosFundo, githubBtn, projectCards,
                                  projectInners, projectDescs], { clearProps: "all" });

                        const orbit = modelViewerElement.getCameraOrbit();
                        const cameraTheta = (orbit.theta * 180) / Math.PI;
                        painelProjetosAnim.style.transform = `translate(0%, -50%) translateY(210px) rotateY(${240 - cameraTheta}deg)`;

                        projetosContainer.style.display = "none";
                        githubBtn.style.display = "none";

                        isProjetosExpanded = false;
                        projetosBusy = false;
                    }
                });

                // Some os outros painéis e o texto de fundo
                tlProjetos.to([painelSobreAnim, painelSkillsAnim, elementosFundo], {
                    autoAlpha: 0, duration: 0.4, pointerEvents: "none"
                }, 0);

                // Os mini-cards ficam escondidos: os cards grandes já estão em cima deles
                tlProjetos.set(miniGrid, { autoAlpha: 0 }, 0);

                // O grid "esvazia": o painel encolhe porque os projetos saíram
                tlProjetos.to(miniGrid, { height: 0, marginTop: 0, marginBottom: 0, duration: 1.2 }, 0);
                tlProjetos.to(linhaDeco, { autoAlpha: 0, duration: 0.4 }, 0);

                tlProjetos.to(painelProjetosAnim, {
                    left: "50%",
                    top: "50%",
                    xPercent: -50,
                    yPercent: -50,
                    width: Math.min(360, W * 0.9) + "px",
                    height: "210px"
                }, 0);

                // Cada card sai do seu mini-card correspondente (mesmo elemento: só cresce e viaja)
                projectCards.forEach((card, i) => {
                    const img = card.querySelector('.proj-img');
                    const escala = minis[i].w / img.offsetWidth;
                    const f = posicoesProjetos[i];

                    tlProjetos.fromTo(card,
                        {
                            x: minis[i].cx - W / 2,
                            y: minis[i].cy - H / 2,
                            scale: escala,
                            rotation: 0
                        },
                        {
                            x: f.x * W,
                            y: f.y * H,
                            scale: 1,
                            rotation: f.rot,
                            duration: 1.5,
                            ease: "power3.inOut"
                        },
                        i * 0.07
                    );

                    tlProjetos.fromTo(projectDescs[i],
                        { autoAlpha: 0 },
                        { autoAlpha: 1, duration: 0.5, ease: "power1.out" },
                        1.0 + i * 0.07
                    );
                });

                // Botão do Github surge de baixo do painel
                gsap.set(githubBtn, { xPercent: -50, left: "50%" });
                tlProjetos.fromTo(githubBtn,
                    { autoAlpha: 0, display: "flex", y: -20 },
                    { autoAlpha: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" },
                    0.8
                );

                gsap.to(btnProjetos, { opacity: 0, duration: 0.3, onComplete: () => {
                    btnProjetos.textContent = "Click to come back";
                    gsap.to(btnProjetos, { opacity: 1, duration: 0.3 });
                }});

                isProjetosExpanded = true;
            } else {
                // === VOLTA (RECOLHER) ===
                projetosBusy = true;

                gsap.to(btnProjetos, { opacity: 0, duration: 0.2, onComplete: () => {
                    btnProjetos.textContent = "Click to expand";
                    gsap.to(btnProjetos, { opacity: 1, duration: 0.3 });
                }});

                // Para a flutuação suavemente e, só então, os cards voltam para dentro do painel
                floatTweens.forEach(t => t.kill());
                floatTweens = [];
                gsap.to(projectInners, {
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out",
                    onComplete: () => tlProjetos.timeScale(1.15).reverse()
                });
            }
        });
    }

    // ==================================================
    // 4. TRANSIÇÃO AO CLICAR NUM PROJETO
    //    O card cresce até ocupar a tela inteira (como se o site abrisse),
    //    os outros elementos somem e só então navegamos para o site.
    // ==================================================
    let navegando = false;

    const abrirProjeto = (link, url) => {
        const wrapper = link.closest('.proj-card-wrapper');
        const img = link.querySelector('.proj-img');
        const foto = img.querySelector('img');
        const W = window.innerWidth;
        const H = window.innerHeight;

        // Posição/tamanho/rotação ATUAIS do card (inclui o leve zoom do hover, se o mouse estiver em cima)
        const r = img.getBoundingClientRect();
        const zoom = link.matches(':hover') ? 1.03 : 1;
        const w = img.offsetWidth * zoom;
        const h = img.offsetHeight * zoom;
        const rot = gsap.getProperty(wrapper, 'rotation');

        // Para a flutuação para o card não se mexer durante a transição
        floatTweens.forEach(t => t.kill());
        floatTweens = [];

        // Clone que vai crescer até a tela inteira
        const overlay = document.createElement('div');
        overlay.className = 'proj-transicao';
        if (foto) overlay.innerHTML = `<img src="${foto.getAttribute('src')}" alt="">`;
        document.body.appendChild(overlay);

        gsap.set(overlay, {
            left: r.left + r.width / 2 - w / 2,
            top: r.top + r.height / 2 - h / 2,
            width: w,
            height: h,
            rotation: rot,
            borderRadius: 16 * zoom
        });
        gsap.set(wrapper, { autoAlpha: 0 }); // o original some, o clone assume exatamente no mesmo lugar

        const outros = Array.from(projectCards).filter(c => c !== wrapper);

        const tlNav = gsap.timeline({
            defaults: { ease: "power3.inOut" },
            onComplete: () => { window.location.href = url; }
        });

        tlNav.to(overlay, { left: 0, top: 0, width: W, height: H, rotation: 0, borderRadius: 0, duration: 0.95 }, 0);
        tlNav.to(outros, { autoAlpha: 0, scale: 0.85, duration: 0.5 }, 0);
        tlNav.to([painelProjetosAnim, githubBtn], { autoAlpha: 0, duration: 0.4 }, 0);
    };

    projectInners.forEach(link => {
        // Pré-carrega o site quando o mouse passa por cima: a página abre mais rápido depois da animação
        link.addEventListener('mouseenter', () => {
            const url = link.getAttribute('href');
            if (!url || url === '#' || link.dataset.prefetch) return;
            const pf = document.createElement('link');
            pf.rel = 'prefetch';
            pf.href = url;
            document.head.appendChild(pf);
            link.dataset.prefetch = '1';
        });

        link.addEventListener('click', (e) => {
            const url = link.getAttribute('href');
            if (!url || url === '#') return;
            // Ctrl/Cmd/Shift + clique continuam abrindo em nova aba normalmente
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            if (navegando) return;
            navegando = true;
            abrirProjeto(link, url);
        });
    });

    // Se o visitante voltar pelo botão "voltar" do navegador, recarrega a página limpa
    window.addEventListener('pageshow', (e) => {
        if (e.persisted && navegando) window.location.reload();
    });
});
