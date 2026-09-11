$ErrorActionPreference = "Stop"

$p = "src\App.tsx"

$s = Get-Content $p -Raw

# Add pathname detection
$s = $s.Replace(
"if (path === '/ai-career-coach') {",
"if (path === '/ai-english-coach') {
        setActiveTab('ai-english-coach');
      } else if (path === '/ai-career-coach') {"
)

# Add navigation
$s = $s.Replace(
"if (tab === 'ai-interview') {",
"if (tab === 'ai-english-coach') {
    window.history.pushState({}, '', '/ai-english-coach');
  } else if (tab === 'ai-interview') {"
)

# Add page rendering
$s = $s.Replace(
"{activeTab === 'ai-career-coach' && (",
"{activeTab === 'ai-english-coach' && (
          <AiEnglishCoachView />
        )}

        {activeTab === 'ai-career-coach' && ("
)

Set-Content $p $s -Encoding UTF8

Write-Host ""
Write-Host "App.tsx route changes completed." -ForegroundColor Green