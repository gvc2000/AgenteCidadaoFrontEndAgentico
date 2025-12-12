# Script para atualizar workflow no n8n via API (versao corrigida)

$apiKey = "c60172b3-76c3-4c78-af5a-2043efe9c0b8"
$workflowId = "KfG18yoo9n7C0odE"
$n8nUrl = "https://n8n-agentecidadaoagentico-production.up.railway.app"
$workflowFile = "Agente Cidadao - Multi-Agentes.json"

Write-Host "Lendo arquivo do workflow..." -ForegroundColor Cyan

# Ler e parsear o JSON
$workflowJson = Get-Content -Path $workflowFile -Raw | ConvertFrom-Json

# Preparar o payload apenas com os campos necessarios
$payload = @{
    name = $workflowJson.name
    nodes = $workflowJson.nodes
    connections = $workflowJson.connections
    settings = $workflowJson.settings
    staticData = if ($workflowJson.staticData) { $workflowJson.staticData } else { $null }
    tags = $workflowJson.tags
} | ConvertTo-Json -Depth 100

# Headers
$headers = @{
    "X-N8N-API-KEY" = $apiKey
    "Content-Type" = "application/json; charset=utf-8"
}

Write-Host "Enviando atualizacao para o n8n..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$n8nUrl/api/v1/workflows/$workflowId" `
        -Method Put `
        -Headers $headers `
        -Body $payload `
        -ContentType "application/json; charset=utf-8"

    Write-Host ""
    Write-Host "Workflow atualizado com sucesso!" -ForegroundColor Green
    Write-Host "ID: $($response.id)" -ForegroundColor Yellow
    Write-Host "Nome: $($response.name)" -ForegroundColor Yellow
    Write-Host "Versao: $($response.versionId)" -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "Erro ao atualizar workflow:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Detalhes do erro:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }

    Write-Host ""
    Write-Host "Sugestoes:" -ForegroundColor Cyan
    Write-Host "1. Verifique se a API Key esta correta" -ForegroundColor White
    Write-Host "2. Verifique se o workflow existe no n8n" -ForegroundColor White
    Write-Host "3. Tente importar manualmente pela interface web" -ForegroundColor White
    Write-Host ""
}
