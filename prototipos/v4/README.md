# Agente Cidadão - Protótipo v4

## Visão Geral

A versão 4 do protótipo combina o melhor de dois mundos:
- **Layout compacto e clean** da v3_compacta
- **Informações completas** sobre fontes de dados e funcionamento da v3_multi_agentes

## Principais Características

### 1. Design Compacto
- Interface minimalista e moderna
- Agentes exibidos de forma compacta
- Foco na experiência do usuário

### 2. Seções Informativas

#### Fontes de Dados Oficiais
Apresenta as três principais fontes de dados do sistema:
- **API Câmara dos Deputados** - Ativa (badge verde)
- **Dados Abertos do Senado** - Em breve (badge laranja)
- **Portal da Transparência** - Em breve (badge laranja)

#### Como Funciona
Explica o fluxo de trabalho em 5 etapas:
1. Você Pergunta
2. Orquestrador Analisa
3. Especialistas Trabalham
4. Sintetizador Consolida
5. Resposta Completa

### 3. Badges de Status
- **Verde**: Fonte de dados ativa e disponível
- **Laranja**: Fonte de dados "Em breve" (ainda não disponível)

## Estrutura de Arquivos

```
v4/
├── index.html          # Página principal
├── admin.html          # Painel administrativo
├── login.html          # Página de login
├── README.md           # Esta documentação
├── assets/             # Imagens dos agentes
│   ├── agent_orchestrator.png
│   ├── agent_legislative.png
│   ├── agent_political.png
│   ├── agent_fiscal.png
│   └── agent_synthesizer.png
├── css/
│   ├── main.css        # Estilos principais
│   └── animations.css  # Animações
└── js/
    ├── app.js          # Lógica principal
    ├── agents.js       # Controle dos agentes
    ├── api.js          # Comunicação com API
    └── i18n.js         # Internacionalização
```

## Mudanças em Relação à v3_compacta

1. ✅ Adicionada seção "Fontes de Dados Oficiais"
2. ✅ Adicionada seção "Como Funciona"
3. ✅ Implementado sistema de badges com status "Em breve"
4. ✅ Mantido layout compacto e clean
5. ✅ Estilos CSS otimizados para as novas seções

## Como Usar

1. Abra `index.html` em um navegador moderno
2. Digite sua pergunta no campo de entrada
3. Observe os agentes trabalhando
4. Receba a resposta consolidada

## Tecnologias

- HTML5
- CSS3 (com CSS Variables)
- JavaScript (Vanilla)
- Google Fonts (Inter)

## Próximos Passos

- [ ] Integrar API do Senado
- [ ] Integrar Portal da Transparência
- [ ] Implementar mais exemplos de perguntas
- [ ] Adicionar mais idiomas

---

**Versão**: 4.0  
**Data**: Novembro 2024  
**Status**: Protótipo
