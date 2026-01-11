# Proposta de Arquitetura: Ciclo de Revisão e Enriquecimento

Esta proposta introduz um **Agente Revisor** no fluxo de trabalho para garantir a qualidade, consistência e completude das respostas antes de serem entregues ao usuário.

## Diagrama do Fluxo

```mermaid
flowchart TD
    %% Estilos
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef ai fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,color:#01579b;
    classDef logic fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100;
    classDef critical fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#880e4f;

    Start((Início / Webhook)) --> Orch[Orquestrador]
    
    subgraph "Fase 1: Execução Inicial"
        Orch --> Router{Roteamento}
        Router -->|Legislação| AgLeg[Agente Legislativo]
        Router -->|Política| AgPol[Agente Político]
        Router -->|Gastos| AgFis[Agente Fiscal]
    end

    AgLeg --> Merge[Consolidação Preliminar]
    AgPol --> Merge
    AgFis --> Merge

    Merge --> Revisor{{🕵️ Agente Revisor}}

    subgraph "Fase 2: Controle de Qualidade"
        Revisor --> Decisao{Aprovado?}
        
        %% Caminho 1: Aprovado
        Decisao -->|Sim: Resposta Completa| Sint[Sintetizador]
        
        %% Caminho 2: Refinamento (Loop)
        Decisao -.->|Não: Dados Insuficientes| Retry[Refinamento de Prompt]
        Retry -.->|Tentar Novamente| Router
        
        %% Caminho 3: Enriquecimento (Cross-Agent)
        Decisao -.->|Enriquecer: Falta Contexto| CrossTrigger[Acionar Outro Agente]
        CrossTrigger -.->|Ex: Pedir Perfil do Deputado| AgPol
    end

    Sint --> End((Resposta Final))

    %% Classes
    class Orch,AgLeg,AgPol,AgFis,Sint ai;
    class Router,Merge,Decisao logic;
    class Revisor,Retry,CrossTrigger critical;
```

## Detalhes dos Componentes

### 1. Agente Revisor (O "Editor-Chefe")
*   **Função:** Analisar as respostas dos agentes especialistas.
*   **Critérios:**
    *   A resposta atende à pergunta do usuário?
    *   Há contradições entre os agentes?
    *   Faltam dados essenciais?
*   **Ações:** Aprovar, Solicitar Refinamento ou Solicitar Enriquecimento.

### 2. Loop de Refinamento
*   Permite que o sistema tente novamente caso a busca inicial falhe (ex: erro de digitação, parâmetros incorretos).

### 3. Enriquecimento (Cross-Agent)
*   Permite que o Revisor acione agentes que não foram chamados inicialmente para adicionar contexto valioso (ex: adicionar perfil político a uma consulta fiscal).
