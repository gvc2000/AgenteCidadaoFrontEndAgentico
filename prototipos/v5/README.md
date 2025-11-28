# Agente Cidadão - Protótipo v5

## Visão Geral

A versão 5 aprimora a v4 com melhorias de UX e layout:

## Principais Mudanças

### 1. Layout Otimizado para Primeira Visão
- **Barra de busca termina a primeira tela**: A primeira visão (sem scroll) agora termina exatamente na barra de busca
- Melhor hierarquia visual
- Foco imediato na ação principal (fazer uma pergunta)

### 2. Seção de Exemplos Redesenhada
- **Movida para depois do chat**: Agora aparece após a barra de busca
- **Novo layout em cards**: Cards maiores com ícones visuais
- **Ícones temáticos**: Cada exemplo tem um ícone relacionado (🏛️, 💰, 📚, etc.)
- **Sem nomes reais**: Substituídos por "Fulano", "Beltrano", etc.
- **Grid responsivo**: Layout em grid que se adapta ao tamanho da tela

### 3. Exemplos Atualizados

| Exemplo Anterior | Exemplo Novo |
|-----------------|--------------|
| "Despesas do deputado Eduardo Bolsonaro" | "Despesas do deputado Fulano" |
| "Histórico de votação de Tabata Amaral" | "Histórico de votação do deputado Beltrano" |
| 5 exemplos | 6 exemplos (adicionado "Proposições sobre saúde") |

## Estrutura Visual

```
┌─────────────────────────┐
│ Header                  │
├─────────────────────────┤
│ Hero (Título)           │
│ Agent Stage (hidden)    │
│ Chat Messages           │
│ ▼ Barra de Busca ◄─────┼─ Fim da primeira visão
├─────────────────────────┤
│ Exemplos (NOVO LAYOUT)  │
│ Fontes de Dados         │
│ Como Funciona           │
│ Footer                  │
└─────────────────────────┘
```

## Melhorias de CSS

### Novos Estilos
- `.examples-subtitle`: Subtítulo explicativo
- `.example-icon`: Ícones dos exemplos (1.5rem)
- `.example-text`: Texto do exemplo
- Grid responsivo: `repeat(auto-fit, minmax(200px, 1fr))`

### Cards de Exemplo
- Padding aumentado: `1rem`
- Border radius: `12px`
- Hover com elevação: `translateY(-2px)`
- Sombra no hover: `var(--shadow-md)`

## Tecnologias

- HTML5
- CSS3 (Grid Layout)
- JavaScript (Vanilla)
- Google Fonts (Inter)

## Compatibilidade

- ✅ Desktop
- ✅ Tablet
- ✅ Mobile (grid adapta para 1 coluna)

---

**Versão**: 5.0  
**Data**: Novembro 2024  
**Base**: v4  
**Status**: Protótipo
