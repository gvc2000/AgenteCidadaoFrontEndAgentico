# 🎨 Melhoria na Formatação das Respostas - Sintetizador

**Data:** 2025-12-12
**Problema:** Respostas aglomeradas e difíceis de ler
**Solução:** System message otimizado com espaçamento e estrutura clara

---

## 📸 Antes vs Depois

### ❌ ANTES (Problema identificado)

![Exemplo ruim](./docs/formatting-before.png)

```
Autor: Deputado Nikolas Ferreira (PL/MG)
Ementa: Susta os efeitos da Nota Técnica Conjunta n° 2/2024-SAPS/SAES/MS.
Status: Aguardando Encaminhamento
Última movimentação: 19/04/2024 - CCP (Coordenação de Comissões Permanentes)
PLP 52/2024 - Institui e regulamenta os regimes específicos de tributação aplicáveis aos serviços financeiros e planos de assistência à saúde.
Autor: Deputado Nikolas Ferreira (PL/MG)
Ementa: Institui e regulamenta os regimes específicos de tributação aplicáveis aos serviços financeiros e planos de assistência à saúde.
Status: Em tramitação
```

**Problemas:**
- ❌ Texto corrido sem separação visual
- ❌ Difícil identificar onde começa e termina cada proposição
- ❌ Campos misturados (Autor, Ementa, Status sem hierarquia)
- ❌ Falta de espaçamento entre linhas
- ❌ Informações importantes não destacadas

---

### ✅ DEPOIS (Com novo system message)

```markdown
## 📜 Proposições de Deputado Nikolas Ferreira

Encontrei **3 proposições** tramitando na Câmara:

---

### PDC 177/2024 - Susta Nota Técnica sobre Planos de Saúde

**Autor:** Deputado Nikolas Ferreira (PL/MG)

**Ementa:** Susta os efeitos da Nota Técnica Conjunta n° 2/2024-SAPS/SAES/MS.

**Status:** Aguardando Encaminhamento

**Última movimentação:** 19/04/2024 - CCP (Coordenação de Comissões Permanentes)

---

### PLP 52/2024 - Tributação de Serviços Financeiros e Saúde

**Autor:** Deputado Nikolas Ferreira (PL/MG)

**Ementa:** Institui e regulamenta os regimes específicos de tributação aplicáveis aos serviços financeiros e planos de assistência à saúde.

**Status:** Em tramitação

---

### RCP 2/2024 - CPI dos Planos de Saúde

**Autor:** Deputado Nikolas Ferreira (PL/MG)

**Ementa:** Requer a criação de Comissão Parlamentar de Inquérito para investigar os planos de saúde ("CPI DOS PLANOS DE SAÚDE").

**Status:** Em tramitação

---

**Fonte:** Câmara dos Deputados
```

**Melhorias:**
- ✅ Cada proposição claramente separada com `---`
- ✅ Títulos descritivos (não apenas número)
- ✅ Campos em negrito para destaque visual
- ✅ Linha em branco após cada título
- ✅ Linha em branco entre cada campo
- ✅ Hierarquia visual clara (##, ###)
- ✅ Informações-chave destacadas em **negrito**
- ✅ Espaçamento adequado = fácil leitura

---

## 📋 Principais Mudanças no System Message

### 1. **Estrutura Obrigatória para Listas**

Cada item de lista DEVE seguir este formato:

```markdown
### [Título do Item]

**Campo 1:** Valor

**Campo 2:** Valor

**Campo 3:** Valor

---
```

### 2. **Separadores Visuais**

- `---` entre CADA item da lista
- Linha em branco após cada `###`
- Linha em branco antes de cada `---`
- Linha em branco depois de cada `---`

### 3. **Campos em Linhas Separadas**

❌ **Não faça:**
```
- Autor: Nome, Partido: XX, Status: Tramitando
```

✅ **Faça:**
```
**Autor:** Nome

**Partido:** XX

**Status:** Tramitando
```

### 4. **Títulos Descritivos**

❌ **Não faça:**
```
### PL 5792/2025
```

✅ **Faça:**
```
### PL 5792/2025 - Observatórios de Transparência em Licitações com IA
```

---

## 🎯 Templates por Tipo de Resposta

### Proposições Legislativas

```markdown
## 📜 Proposições sobre [Tema]

Encontrei **[N] proposições**:

---

### [Tipo] [Número]/[Ano] - [Título Resumido]

**Autor:** Deputado [Nome] ([Partido]/[UF])

**Ementa:** [Texto da ementa]

**Status:** [Status]

**Última movimentação:** [Data] - [Local]

---

### [Próxima proposição...]

---

**Fonte:** Câmara dos Deputados
```

### Perfil de Deputado

```markdown
## 👤 [Nome do Deputado]

**Partido:** [Sigla] | **UF:** [Estado]

### Dados Pessoais

**Data de Nascimento:** [Data]

**Naturalidade:** [Cidade/UF]

**Profissão:** [Profissões]

### Contato

**Gabinete:** Sala [X], Anexo [Y]

**Telefone:** [Número]

**Email:** [Email]

---

**Fonte:** Câmara dos Deputados
```

### Despesas

```markdown
## 💰 Despesas de [Nome] em [Período]

**Total Gasto:** R$ [valor]

### Principais Categorias

**1. [Categoria]:** R$ [valor] (XX%)

**2. [Categoria]:** R$ [valor] (XX%)

**3. [Categoria]:** R$ [valor] (XX%)

### Destaques

**Maior gasto:** R$ [valor] em [Categoria] ([Data])

**Categoria mais frequente:** [Nome] ([N] documentos)

---

**Fonte:** Câmara dos Deputados
```

---

## 📐 Regras de Espaçamento

### Obrigatório

1. ✅ Linha em branco após `##` (título principal)
2. ✅ Linha em branco após `###` (subtítulos)
3. ✅ Linha em branco entre campos de dados
4. ✅ `---` para separar itens de lista
5. ✅ Linha em branco antes do `---`
6. ✅ Linha em branco depois do `---`

### Exemplo Completo

```markdown
## 📜 Título Principal
                          ← linha em branco
Texto introdutório.
                          ← linha em branco
---
                          ← linha em branco
### Item 1
                          ← linha em branco
**Campo:** Valor
                          ← linha em branco
**Campo:** Valor
                          ← linha em branco
---
                          ← linha em branco
### Item 2
                          ← linha em branco
**Campo:** Valor
                          ← linha em branco
---
                          ← linha em branco
**Fonte:** Câmara dos Deputados
```

---

## 🔧 Como Aplicar a Melhoria

### Passo a Passo

1. **Abra o arquivo** `system-message-sintetizador.md`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Acesse o n8n** e abra o workflow "Agente Cidadao - Multi-Agentes"
4. **Clique no nó "Sintetizador"**
5. **Expanda "Options"**
6. **Localize "System Message"**
7. **Apague o conteúdo atual**
8. **Cole o novo conteúdo**
9. **Salve o workflow**
10. **Teste com uma query**

### Query de Teste Sugerida

```
"Proposições sobre inteligência artificial em 2025"
```

Ou:

```
"Quem é Nikolas Ferreira e quais proposições ele apresentou sobre saúde?"
```

---

## 📊 Impacto Esperado

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Legibilidade** | 4/10 | 9/10 | +125% |
| **Separação Visual** | Ruim | Excelente | +200% |
| **Hierarquia Clara** | Não | Sim | ✅ |
| **Espaçamento** | Aglomerado | Adequado | ✅ |
| **Destaque de Info** | Não | Sim (negrito) | ✅ |
| **Facilidade de Scan** | Difícil | Fácil | +150% |

---

## 🎓 Princípios de Design Aplicados

### 1. **Espaço em Branco (Whitespace)**
- Permite que os olhos "descansem"
- Cria hierarquia visual natural
- Facilita escaneamento rápido

### 2. **Hierarquia Tipográfica**
- `##` = Título principal
- `###` = Itens/seções
- `**negrito**` = Campos-chave
- Texto normal = Valores

### 3. **Separadores Visuais**
- `---` cria linha horizontal
- Demarca início/fim de blocos
- Guia o olho verticalmente

### 4. **Consistência**
- Mesmo padrão para todos os itens
- Previsibilidade = facilidade
- Reduz carga cognitiva

### 5. **Destaque Estratégico**
- Negrito apenas em labels importantes
- Não abuse do negrito (perde efeito)
- Use emojis com moderação

---

## ✅ Checklist de Implementação

- [ ] System message copiado do arquivo
- [ ] Nó Sintetizador atualizado no n8n
- [ ] Workflow salvo
- [ ] Teste realizado com query
- [ ] Formatação verificada no frontend
- [ ] Espaçamento adequado confirmado
- [ ] Separadores `---` funcionando
- [ ] Campos em negrito visíveis
- [ ] Hierarquia de títulos correta

---

## 🐛 Troubleshooting

### Problema: Markdown não renderiza

**Causa:** Frontend pode não estar processando Markdown
**Solução:** Verificar se `ReactMarkdown` está com `remarkGfm` habilitado

### Problema: Separadores não aparecem

**Causa:** CSS pode estar ocultando `<hr>`
**Solução:** Verificar estilos CSS para `hr` tags

### Problema: Negrito não funciona

**Causa:** Sintaxe incorreta ou conflito de processamento
**Solução:** Garantir `**texto**` (dois asteriscos)

### Problema: Respostas ainda aglomeradas

**Causa:** LLM pode estar ignorando instruções
**Solução:** Reforçar exemplos no system message, adicionar mais exemplos de DO/DON'T

---

## 📚 Referências

- [Markdown Guide - Basic Syntax](https://www.markdownguide.org/basic-syntax/)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [ReactMarkdown + remark-gfm](https://github.com/remarkjs/remark-gfm)
- Princípios de Design: Visual Hierarchy, Whitespace, Consistency

---

**Desenvolvido em:** 2025-12-12
**Versão:** 1.0
**Próxima revisão:** Após feedback dos usuários
