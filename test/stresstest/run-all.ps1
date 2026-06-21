param(
    [string]$BaseUrl = "https://workorders-production.up.railway.app"
)

$ErrorActionPreference = "Continue"
$ReportDir = Join-Path $PSScriptRoot "reports"
$ScriptsDir = Join-Path $PSScriptRoot "scenarios"

if (-not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
}

$scenarios = @(
    @{ Name = "01 - Auth Flow"; File = "01-auth.js" },
    @{ Name = "02 - Public & Client"; File = "02-public-client.js" },
    @{ Name = "03 - Service Request"; File = "03-service-request.js" },
    @{ Name = "04 - Work Order"; File = "04-work-order.js" },
    @{ Name = "05 - Work Report"; File = "05-work-report.js" },
    @{ Name = "06 - Dashboard"; File = "06-dashboard.js" },
    @{ Name = "07 - Company Admin"; File = "07-company-admin.js" },
    @{ Name = "08 - Services & Config"; File = "08-services-config.js" }
)

# ═══════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════

function ConvertTo-Ms {
    param([string]$v)
    if ([string]::IsNullOrWhiteSpace($v)) { return $null }
    $v = $v.Trim()
    if ($v -match '^([0-9.]+)\s*µs$') { return [math]::Round([double]$matches[1] / 1000, 2) }
    if ($v -match '^([0-9.]+)\s*ms$') { return [math]::Round([double]$matches[1], 2) }
    if ($v -match '^([0-9.]+)\s*s$')  { return [math]::Round([double]$matches[1] * 1000, 2) }
    if ($v -match '^([0-9.]+)$')      { return [math]::Round([double]$matches[1], 2) }
    return $null
}

function ConvertTo-KBs {
    param([double]$v, [string]$u)
    switch ($u) {
        'B'  { return [math]::Round($v / 1024, 2) }
        'kB' { return [math]::Round($v, 2) }
        'KB' { return [math]::Round($v, 2) }
        'MB' { return [math]::Round($v * 1024, 2) }
        'GB' { return [math]::Round($v * 1024 * 1024, 2) }
        default { return [math]::Round($v, 2) }
    }
}

function Get-TrendStat {
    param([string]$line, [string]$stat)
    $esc = [regex]::Escape($stat)
    if ($line -match "${esc}=([0-9.]+\s*(?:µs|ms|s)?)") {
        return ConvertTo-Ms $matches[1]
    }
    return $null
}

function Format-Cell {
    param($val)
    if ($null -eq $val) { return "N/A" }
    return '{0:N2}' -f [double]$val
}

function Parse-K6Output {
    param([array]$lines)

    $r = @{
        Samples = 0; Fail = 0; ErrorPct = 0.0
        Avg = $null; Min = $null; Max = $null; Med = $null
        P90 = $null; P95 = $null
        TPS = $null; RecvKBs = $null; SentKBs = $null
        Iterations = 0; IterRate = $null
        ChecksPct = $null
    }

    foreach ($rawLine in $lines) {
        $t = "$rawLine"

        if ($t -match 'http_req_duration[.\s]*:' -and $t -notmatch 'expected_response') {
            $r.Avg = Get-TrendStat $t 'avg'
            $r.Min = Get-TrendStat $t 'min'
            $r.Med = Get-TrendStat $t 'med'
            $r.Max = Get-TrendStat $t 'max'
            $r.P90 = Get-TrendStat $t 'p(90)'
            $r.P95 = Get-TrendStat $t 'p(95)'
        }

        if ($t -match 'http_reqs[.\s]*:\s*(\d+)\s+([0-9.]+)/s') {
            $r.Samples = [int]$matches[1]
            $r.TPS = [math]::Round([double]$matches[2], 2)
        }

        if ($t -match 'http_req_failed[.\s]*:\s*([0-9.]+)%') {
            $r.ErrorPct = [double]$matches[1]
        }

        if ($t -match 'data_received[.\s]*:.*?([0-9.]+)\s+(B|kB|KB|MB|GB)/s') {
            $r.RecvKBs = ConvertTo-KBs ([double]$matches[1]) $matches[2]
        }

        if ($t -match 'data_sent[.\s]*:.*?([0-9.]+)\s+(B|kB|KB|MB|GB)/s') {
            $r.SentKBs = ConvertTo-KBs ([double]$matches[1]) $matches[2]
        }

        if ($t -match 'iterations[.\s]*:\s*(\d+)\s+([0-9.]+)/s') {
            $r.Iterations = [int]$matches[1]
            $r.IterRate = [math]::Round([double]$matches[2], 2)
        }

        if ($t -match 'checks[.\s]*:\s*([0-9.]+)%') {
            $r.ChecksPct = [double]$matches[1]
        }
    }

    $r.Fail = [math]::Floor($r.Samples * $r.ErrorPct / 100)
    return $r
}

# ═══════════════════════════════════════════
# Main Execution
# ═══════════════════════════════════════════

$startTime = Get-Date
$env:BASE_URL = $BaseUrl

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  WORK ORDER PORTAL - STRESS TEST RUNNER " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Target: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

$allResults = @()

foreach ($scenario in $scenarios) {
    $name = $scenario.Name
    $file = $scenario.File
    $filePath = Join-Path $ScriptsDir $file
    $jsonFile = "report-$($file -replace '\.js$', '').json"
    $outputPath = Join-Path $ReportDir $jsonFile

    Write-Host ">>> Running: $name" -ForegroundColor Green
    Write-Host "    File: $file" -ForegroundColor Gray

    $output = & k6 run --no-color "--out" "json=$outputPath" $filePath 2>&1
    $output | ForEach-Object { Write-Host $_ }

    $parsed = Parse-K6Output $output

    $allResults += [PSCustomObject]@{
        Scenario   = $name
        Samples    = $parsed.Samples
        Fail       = $parsed.Fail
        ErrorPct   = $parsed.ErrorPct
        Avg        = $parsed.Avg
        Min        = $parsed.Min
        Max        = $parsed.Max
        Med        = $parsed.Med
        P90        = $parsed.P90
        P95        = $parsed.P95
        TPS        = $parsed.TPS
        RecvKBs    = $parsed.RecvKBs
        SentKBs    = $parsed.SentKBs
        Iterations = $parsed.Iterations
        ChecksPct  = $parsed.ChecksPct
    }

    Write-Host "<<< Completed: $name" -ForegroundColor Green
    Write-Host ""
}

$endTime = Get-Date
$totalDuration = $endTime - $startTime

# ═══════════════════════════════════════════
# Compute Totals
# ═══════════════════════════════════════════

$totSamples = ($allResults | Measure-Object -Property Samples -Sum).Sum
$totFail    = ($allResults | Measure-Object -Property Fail -Sum).Sum
$totErrPct  = if ($totSamples -gt 0) { [math]::Round($totFail / $totSamples * 100, 2) } else { 0 }
$totIter    = ($allResults | Measure-Object -Property Iterations -Sum).Sum

$valid = $allResults | Where-Object { $null -ne $_.Avg -and $_.Samples -gt 0 }
$validSamplesSum = if ($valid.Count -gt 0) { ($valid | Measure-Object -Property Samples -Sum).Sum } else { 0 }

function WeightedAvg {
    param($items, [string]$prop, [int]$divisor)
    if ($items.Count -eq 0 -or $divisor -eq 0) { return $null }
    $sum = 0
    foreach ($item in $items) {
        $v = $item.$prop
        if ($null -ne $v) { $sum += $v * $item.Samples }
    }
    return [math]::Round($sum / $divisor, 2)
}

$totAvg = WeightedAvg $valid 'Avg' $validSamplesSum
$totMin = if ($valid.Count -gt 0) { ($valid | Where-Object { $null -ne $_.Min } | Measure-Object -Property Min -Minimum).Minimum } else { $null }
$totMax = if ($valid.Count -gt 0) { ($valid | Where-Object { $null -ne $_.Max } | Measure-Object -Property Max -Maximum).Maximum } else { $null }
$totMed = WeightedAvg $valid 'Med' $validSamplesSum
$totP90 = WeightedAvg $valid 'P90' $validSamplesSum
$totP95 = WeightedAvg $valid 'P95' $validSamplesSum

$vTPS  = $allResults | Where-Object { $null -ne $_.TPS }
$totTPS  = if ($vTPS.Count -gt 0)  { [math]::Round(($vTPS  | Measure-Object -Property TPS -Sum).Sum, 2) }  else { $null }
$vRecv = $allResults | Where-Object { $null -ne $_.RecvKBs }
$totRecv = if ($vRecv.Count -gt 0) { [math]::Round(($vRecv | Measure-Object -Property RecvKBs -Sum).Sum, 2) } else { $null }
$vSent = $allResults | Where-Object { $null -ne $_.SentKBs }
$totSent = if ($vSent.Count -gt 0) { [math]::Round(($vSent | Measure-Object -Property SentKBs -Sum).Sum, 2) } else { $null }

# ═══════════════════════════════════════════
# Terminal Summary
# ═══════════════════════════════════════════

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "           STRESS TEST SUMMARY            " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Duration : $($totalDuration.ToString('hh\:mm\:ss'))" -ForegroundColor Yellow
Write-Host "Requests : $totSamples | Failed: $totFail | Error Rate: $totErrPct%" -ForegroundColor $(if ($totErrPct -gt 5) { "Red" } else { "Green" })
Write-Host ""

$allResults | Format-Table -Property Scenario,
    @{L='#Samples';E={$_.Samples}},
    @{L='Fail';E={$_.Fail}},
    @{L='Err%';E={'{0:N2}' -f $_.ErrorPct}},
    @{L='Avg(ms)';E={Format-Cell $_.Avg}},
    @{L='Min(ms)';E={Format-Cell $_.Min}},
    @{L='Max(ms)';E={Format-Cell $_.Max}},
    @{L='Med(ms)';E={Format-Cell $_.Med}},
    @{L='P90(ms)';E={Format-Cell $_.P90}},
    @{L='P95(ms)';E={Format-Cell $_.P95}},
    @{L='TPS';E={Format-Cell $_.TPS}},
    @{L='Recv KB/s';E={Format-Cell $_.RecvKBs}},
    @{L='Sent KB/s';E={Format-Cell $_.SentKBs}} -AutoSize

Write-Host ""

# ═══════════════════════════════════════════
# HTML Report
# ═══════════════════════════════════════════

function Build-Row {
    param([string]$label, $samples, $fail, $errPct, $avg, $min, $max, $med, $p90, $p95, $tps, $recv, $sent, [string]$rowClass)

    $cls = if ($rowClass) { " class=`"$rowClass`"" } else { "" }
    $errCls = if ($errPct -gt 5) { " class=`"danger`"" } elseif ($errPct -gt 0) { " class=`"warning`"" } else { "" }

    return @"
<tr$cls>
<td class="label">$label</td>
<td>$samples</td>
<td>$fail</td>
<td$errCls>$('{0:N2}' -f [double]$errPct)%</td>
<td>$(Format-Cell $avg)</td>
<td>$(Format-Cell $min)</td>
<td>$(Format-Cell $max)</td>
<td>$(Format-Cell $med)</td>
<td>$(Format-Cell $p90)</td>
<td>$(Format-Cell $p95)</td>
<td>$(Format-Cell $tps)</td>
<td>$(Format-Cell $recv)</td>
<td>$(Format-Cell $sent)</td>
</tr>
"@
}

$tableRows = Build-Row "Total" $totSamples $totFail $totErrPct $totAvg $totMin $totMax $totMed $totP90 $totP95 $totTPS $totRecv $totSent "total-row"

foreach ($r in $allResults) {
    $rc = if ($r.Samples -eq 0) { "error-row" } else { "" }
    $tableRows += "`n" + (Build-Row $r.Scenario $r.Samples $r.Fail $r.ErrorPct $r.Avg $r.Min $r.Max $r.Med $r.P90 $r.P95 $r.TPS $r.RecvKBs $r.SentKBs $rc)
}

$avgColor = if ($null -ne $totAvg -and $totAvg -lt 500) { "#38a169" } elseif ($null -ne $totAvg -and $totAvg -lt 2000) { "#d69e2e" } else { "#e53e3e" }
$errColor = if ($totErrPct -eq 0) { "#38a169" } elseif ($totErrPct -lt 5) { "#d69e2e" } else { "#e53e3e" }
$avgDisplay = if ($null -ne $totAvg) { "{0:N2}" -f $totAvg } else { "N/A" }
$tpsDisplay = if ($null -ne $totTPS) { "{0:N2}" -f $totTPS } else { "N/A" }
$testDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$durationStr = $totalDuration.ToString('hh\:mm\:ss')
$scenarioCount = $allResults.Count

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Stress Test Report - Work Order Portal</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#f0f2f5;color:#1a202c;min-width:1200px}
.container{max-width:1550px;margin:0 auto;padding:24px}
.header{background:linear-gradient(135deg,#1e2a4a 0%,#2d3e6e 100%);color:#fff;padding:28px 32px;border-radius:12px 12px 0 0}
.header h1{font-size:22px;font-weight:700;margin-bottom:6px}
.header .meta{color:#94a3c0;font-size:13px;line-height:1.8}
.header .meta span{color:#c3cfe2;font-weight:500}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:0;background:#fff;border-bottom:1px solid #e2e8f0}
.card{padding:20px 24px;border-right:1px solid #e2e8f0;text-align:center}
.card:last-child{border-right:none}
.card .value{font-size:32px;font-weight:800;line-height:1.2}
.card .unit{font-size:14px;font-weight:400;opacity:.6}
.card .lbl{font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#718096;margin-top:6px}
.table-wrap{background:#fff;overflow-x:auto;border-radius:0 0 12px 12px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
table{width:100%;border-collapse:collapse;min-width:1180px}
thead th{position:sticky;top:0;z-index:2}
th.group{background:#4a6cf7;color:#fff;padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:.6px;border:1px solid #3b5de7;text-align:center;font-weight:600}
th.sub{background:#5b7cf8;color:#fff;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.4px;border:1px solid #4a6cf7;text-align:center;font-weight:500;white-space:nowrap}
td{padding:7px 10px;font-size:13px;border:1px solid #e8ecf1;text-align:right;font-variant-numeric:tabular-nums}
td.label{text-align:left;font-weight:500;color:#2d3748;white-space:nowrap}
tr:nth-child(even) td{background:#f7f9fc}
tr:hover td{background:#edf2ff}
tr.total-row td{background:#e8edff;font-weight:700;border-top:2px solid #4a6cf7;border-bottom:2px solid #4a6cf7}
tr.total-row td.label{color:#1a1a2e;font-size:14px}
tr.error-row td{background:#fff5f5;color:#a0a0a0}
.danger{color:#e53e3e;font-weight:600}
.warning{color:#d69e2e;font-weight:600}
.footer{padding:16px 24px;background:#fff;border-top:1px solid #e2e8f0;border-radius:0 0 12px 12px;font-size:12px;color:#a0aec0;text-align:center}
@media print{body{background:#fff;min-width:auto}.container{padding:0}.header{border-radius:0}.table-wrap{box-shadow:none;border-radius:0}}
</style>
</head>
<body>
<div class="container">

<div class="header">
  <h1>&#x1F4CA; Stress Test Report &mdash; Work Order Portal</h1>
  <div class="meta">
    <span>Target:</span> $BaseUrl<br>
    <span>Date:</span> $testDate &nbsp;&bull;&nbsp;
    <span>Duration:</span> $durationStr &nbsp;&bull;&nbsp;
    <span>Scenarios:</span> $scenarioCount &nbsp;&bull;&nbsp;
    <span>Iterations:</span> $totIter
  </div>
</div>

<div class="cards">
  <div class="card">
    <div class="value" style="color:#2d3748">$totSamples</div>
    <div class="lbl">Total Requests</div>
  </div>
  <div class="card">
    <div class="value" style="color:$avgColor">$avgDisplay<span class="unit"> ms</span></div>
    <div class="lbl">Avg Response Time</div>
  </div>
  <div class="card">
    <div class="value" style="color:$errColor">$totErrPct<span class="unit">%</span></div>
    <div class="lbl">Error Rate</div>
  </div>
  <div class="card">
    <div class="value" style="color:#4a6cf7">$tpsDisplay<span class="unit"> /s</span></div>
    <div class="lbl">Throughput</div>
  </div>
</div>

<div class="table-wrap">
<table>
<thead>
<tr>
  <th class="group" rowspan="2" style="min-width:180px">Label</th>
  <th class="group" colspan="2">Requests</th>
  <th class="group" colspan="1">Executions</th>
  <th class="group" colspan="6">Response Times (ms)</th>
  <th class="group" colspan="1">Throughput</th>
  <th class="group" colspan="2">Network (KB/sec)</th>
</tr>
<tr>
  <th class="sub">#Samples</th>
  <th class="sub">FAIL</th>
  <th class="sub">Error %</th>
  <th class="sub">Average</th>
  <th class="sub">Min</th>
  <th class="sub">Max</th>
  <th class="sub">Median</th>
  <th class="sub">90th pct</th>
  <th class="sub">95th pct</th>
  <th class="sub">Transactions/s</th>
  <th class="sub">Received</th>
  <th class="sub">Sent</th>
</tr>
</thead>
<tbody>
$tableRows
</tbody>
</table>
</div>

<div class="footer">
  Generated by k6 Stress Test Runner &bull; $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')
</div>

</div>
</body>
</html>
"@

$htmlPath = Join-Path $ReportDir "summary.html"
$html | Out-File -FilePath $htmlPath -Encoding utf8
Write-Host "HTML report saved to: $htmlPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "All scenarios completed!" -ForegroundColor Cyan
