$ErrorActionPreference = "Stop"

Write-Host "🛡️ Iniciando Backup do Supabase..." -ForegroundColor Cyan

# Verifica se a CLI está instalada ou se podemos usar npx
$useNpx = $false
if (-not (Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ CLI global 'supabase' não encontrada." -ForegroundColor Yellow
    Write-Host "🔄 Tentando usar via 'npx supabase'..." -ForegroundColor Cyan
    
    if (Get-Command "npx" -ErrorAction SilentlyContinue) {
        $useNpx = $true
    }
    else {
        Write-Host "❌ Erro: Nem 'supabase' nem 'npx' foram encontrados." -ForegroundColor Red
        Write-Host "Por favor, instale o Node.js ou siga o guia BACKUP_SUPABASE.md para instalar via Scoop." -ForegroundColor Yellow
        exit 1
    }
}

# Define função wrapper para rodar o comando correto
function Invoke-Supabase {
    param([string[]]$Arguments)
    if ($useNpx) {
        $cmdArgs = @("supabase") + $Arguments
        & npx $cmdArgs
    }
    else {
        & supabase $Arguments
    }
}

# Tenta carregar variáveis do arquivo .env se existir
# Assumindo que o usuário já fez login com 'supabase login' ou 'npx supabase login'

$params = @{
    "ProjectRef" = Read-Host "Digite o ID do Projeto (Project Ref) ou pressione Enter se já estiver linkado"
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "$PSScriptRoot/backups"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

if ($params.ProjectRef) {
    Write-Host "🔗 Vinculando projeto..." -ForegroundColor Cyan
    Invoke-Supabase "link", "--project-ref", $params.ProjectRef
}

Write-Host "📦 Gerando dump do schema..." -ForegroundColor Yellow

$schemaFile = "$backupDir/schema_$timestamp.sql"
$rolesFile = "$backupDir/roles_$timestamp.sql"

# Como o projeto está vinculado (ou acabamos de vincular), não precisamos de flag extra
# O comando padrão 'supabase db dump' usa --linked por padrão
Invoke-Supabase "db", "dump", "--schema", "public", "-f", $schemaFile
Invoke-Supabase "db", "dump", "--role-only", "-f", $rolesFile

if ($?) {
    Write-Host "✅ Backup concluído com sucesso!" -ForegroundColor Green
    Write-Host "📁 Arquivos salvos em: $backupDir" -ForegroundColor Gray
    Write-Host "   - $schemaFile"
    Write-Host "   - $rolesFile"
}
else {
    Write-Host "❌ Falha ao realizar backup." -ForegroundColor Red
}
