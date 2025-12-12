# Script para atualizar workflow no n8n via API

$apiKey = "c60172b3-76c3-4c78-af5a-2043efe9c0b8"
$workflowId = "KfG18yoo9n7C0odE"
$n8nUrl = "https://n8n-agentecidadaoagentico-production.up.railway.app"
$workflowFile = "Agente Cidadao - Multi-Agentes.json"

# Ler o conteúdo do arquivo JSON
$workflowContent = Get-Content -Path $workflowFile -Raw

# Fazer a requisição PUT
$headers = @{
    "X-N8N-API-KEY" = $apiKey
    "Content-Type" = "application/json"
}

Write-Host "Atualizando workflow no n8n..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$n8nUrl/api/v1/workflows/$workflowId" `
        -Method Put `
        -Headers $headers `
        -Body $workflowContent

    Write-Host "Workflow atualizado com sucesso!" -ForegroundColor Green
    Write-Host "ID: $($response.id)" -ForegroundColor Yellow
    Write-Host "Nome: $($response.name)" -ForegroundColor Yellow
    Write-Host "Versao: $($response.versionId)" -ForegroundColor Yellow
}
catch {
    Write-Host "Erro ao atualizar workflow:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    # Mostrar detalhes do erro se disponivel
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
