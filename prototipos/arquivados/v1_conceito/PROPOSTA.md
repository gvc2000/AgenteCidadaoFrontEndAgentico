# Proposta de Interface e Protótipo - Agente Cidadão

## Visão Geral
Esta proposta visa modernizar a interface do "Agente Cidadão", focando em uma experiência de usuário mais dinâmica e envolvente, mantendo a estrutura funcional existente. O foco principal é a personificação dos agentes através de personagens 3D animados e suporte bilíngue (Português/Espanhol).

## Diretrizes de Design

### 1. Estilo Visual
- **Paleta de Cores:** Tons de azul profundo, verde azulado e cinza para transmitir tecnologia e confiança, com acentos vibrantes para ações.
- **Tipografia:** Fontes modernas e limpas (Inter ou Roboto) para legibilidade.
- **Layout:** Interface de página única (SPA) para o chat, minimizando recarregamentos.

### 2. Personificação dos Agentes
Cada agente foi transformado em um personagem "robô" único, com visual alinhado à sua função:
- **Orquestrador:** O maestro central, gerenciando o fluxo.
- **Legislativo:** Equipado com referências a leis e documentos.
- **Político:** Visual diplomático.
- **Fiscal:** Focado em números e análise.
- **Sintetizador:** O integrador final das informações.

### 3. Animações Dinâmicas
Ao invés de simples ícones de carregamento, os agentes "entram em cena" quando ativos.
- **Estado Inativo:** Ocultos ou esmaecidos.
- **Estado Ativo:** O agente aparece em destaque, com animação de "trabalho" (pulsação, rotação, processamento de dados).
- **Transição:** Fluxo visual claro de um agente para o outro conforme o processamento ocorre.

### 4. Internacionalização (i18n)
- Suporte nativo para alternância entre Português (PT) e Espanhol (ES).
- Todo o texto da interface é dinâmico, permitindo fácil expansão para outros idiomas.

## Estrutura do Protótipo
O protótipo funcional está localizado nesta pasta (`prototipos/`) e contém:
- `index.html`: A interface principal de chat.
- `login.html`: Tela de login bilíngue.
- `admin.html`: Painel administrativo (mockup).
- `assets/`: Imagens geradas dos agentes.
- `styles.css` & `script.js`: Lógica e estilos customizados.

## Próximos Passos
Após a validação deste protótipo:
1.  Integrar os novos assets e estilos ao projeto React principal.
2.  Implementar a lógica de animação usando componentes React.
3.  Configurar a biblioteca de internacionalização (ex: i18next) no projeto principal.
