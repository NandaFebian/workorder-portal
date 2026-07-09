import json
import os
import sys
from collections import defaultdict
from pathlib import Path
from datetime import datetime

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np

OUTPUT_DIR = r"d:\Perkuliahan\Work Order\workorder-portal\docs\charts"
STRESS_DIR = r"d:\Perkuliahan\Work Order\workorder-portal\test\stresstest-get\reports"
COVERAGE_FILE = r"d:\Perkuliahan\Work Order\workorder-portal\coverage\unit\coverage-final.json"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# COLOR PALETTE
# ============================================================
COLORS = {
    'bg': '#0F172A',
    'card': '#1E293B',
    'text': '#E2E8F0',
    'accent1': '#38BDF8',
    'accent2': '#818CF8',
    'accent3': '#34D399',
    'accent4': '#FB923C',
    'accent5': '#F472B6',
    'accent6': '#A78BFA',
    'grid': '#334155',
    'success': '#22C55E',
    'danger': '#EF4444',
    'warning': '#F59E0B',
}

plt.rcParams.update({
    'figure.facecolor': COLORS['bg'],
    'axes.facecolor': COLORS['card'],
    'axes.edgecolor': COLORS['grid'],
    'axes.labelcolor': COLORS['text'],
    'text.color': COLORS['text'],
    'xtick.color': COLORS['text'],
    'ytick.color': COLORS['text'],
    'grid.color': COLORS['grid'],
    'grid.alpha': 0.3,
    'font.family': 'sans-serif',
    'font.size': 11,
})


# ============================================================
# HELPERS
# ============================================================
def parse_k6_jsonl(filepath):
    """Parse k6 JSON output (JSONL format) and extract http_req_duration points."""
    durations = []  # list of (timestamp, value, url, status)
    req_counts = []
    failures = []
    vus_data = []

    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            if obj.get('type') == 'Point':
                metric = obj.get('metric', '')
                data = obj.get('data', {})
                tags = data.get('tags', {})
                ts = data.get('time', '')
                val = data.get('value', 0)

                if metric == 'http_req_duration':
                    url = tags.get('name', tags.get('url', ''))
                    status = tags.get('status', '')
                    durations.append((ts, val, url, status))
                elif metric == 'http_req_failed':
                    failures.append((ts, val))
                elif metric == 'http_reqs':
                    req_counts.append((ts, val))
                elif metric == 'vus':
                    vus_data.append((ts, val))

    return durations, req_counts, failures, vus_data


def get_report_label(filename):
    """Extract a short label from report filename."""
    name = filename.replace('report-', '').replace('.json', '')
    parts = name.split('-', 1)
    if len(parts) == 2:
        return parts[1].replace('-', ' ').title()
    return name


def parse_timestamp(ts_str):
    """Parse k6 timestamp to seconds offset."""
    try:
        dt = datetime.fromisoformat(ts_str.replace('+08:00', '+08:00'))
        return dt.timestamp()
    except:
        return 0


# ============================================================
# 1. STRESS TEST CHARTS
# ============================================================
print("=" * 60)
print("Processing Stress Test Reports...")
print("=" * 60)

report_files = sorted(Path(STRESS_DIR).glob("report-*.json"))
all_reports = {}

for rf in report_files:
    label = get_report_label(rf.name)
    print(f"  Parsing: {rf.name} ({label})...")
    durations, req_counts, failures, vus_data = parse_k6_jsonl(rf)
    all_reports[label] = {
        'durations': durations,
        'req_counts': req_counts,
        'failures': failures,
        'vus': vus_data,
        'file': rf.name,
    }
    print(f"    -> {len(durations)} duration points, {len(req_counts)} req points")


# --- Chart 1: Response Time Distribution per Report (Box Plot) ---
print("\nGenerating Chart 1: Response Time Distribution...")
fig, ax = plt.subplots(figsize=(14, 7))

labels = []
data_boxes = []
for label, rdata in all_reports.items():
    vals = [d[1] for d in rdata['durations']]
    if vals:
        labels.append(label)
        data_boxes.append(vals)

bp = ax.boxplot(data_boxes, patch_artist=True, labels=labels, showfliers=False,
                medianprops=dict(color=COLORS['warning'], linewidth=2),
                whiskerprops=dict(color=COLORS['text'], linewidth=1.5),
                capprops=dict(color=COLORS['text'], linewidth=1.5))

box_colors = [COLORS['accent1'], COLORS['accent2'], COLORS['accent3'],
              COLORS['accent4'], COLORS['accent5'], COLORS['accent6']]
for patch, color in zip(bp['boxes'], box_colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)

ax.set_title('Distribusi Response Time per Endpoint Group\n(Stress Test - k6)', fontsize=16, fontweight='bold', pad=15)
ax.set_ylabel('Response Time (ms)', fontsize=13)
ax.set_xlabel('Endpoint Group', fontsize=13)
ax.grid(axis='y', alpha=0.3)
ax.tick_params(axis='x', rotation=15)

# Add stats annotation
for i, (label, vals) in enumerate(zip(labels, data_boxes)):
    median = np.median(vals)
    p95 = np.percentile(vals, 95)
    ax.annotate(f'Med: {median:.0f}ms\nP95: {p95:.0f}ms',
                xy=(i + 1, p95), fontsize=8, ha='center', va='bottom',
                color=COLORS['accent3'],
                bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['bg'], alpha=0.8, edgecolor=COLORS['grid']))

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'stress_response_time_distribution.png'), dpi=150, bbox_inches='tight')
plt.close(fig)
print("  -> Saved: stress_response_time_distribution.png")


# --- Chart 2: Summary Bar Chart (Avg, Median, P95, P99) ---
print("Generating Chart 2: Summary Statistics...")
fig, ax = plt.subplots(figsize=(14, 7))

x = np.arange(len(labels))
width = 0.2

avgs, meds, p95s, p99s = [], [], [], []
for vals in data_boxes:
    avgs.append(np.mean(vals))
    meds.append(np.median(vals))
    p95s.append(np.percentile(vals, 95))
    p99s.append(np.percentile(vals, 99))

bars1 = ax.bar(x - 1.5*width, avgs, width, label='Average', color=COLORS['accent1'], alpha=0.85, edgecolor='none')
bars2 = ax.bar(x - 0.5*width, meds, width, label='Median (P50)', color=COLORS['accent3'], alpha=0.85, edgecolor='none')
bars3 = ax.bar(x + 0.5*width, p95s, width, label='P95', color=COLORS['accent4'], alpha=0.85, edgecolor='none')
bars4 = ax.bar(x + 1.5*width, p99s, width, label='P99', color=COLORS['accent5'], alpha=0.85, edgecolor='none')

ax.set_title('Statistik Response Time per Endpoint Group\n(Avg / Median / P95 / P99)', fontsize=16, fontweight='bold', pad=15)
ax.set_ylabel('Response Time (ms)', fontsize=13)
ax.set_xlabel('Endpoint Group', fontsize=13)
ax.set_xticks(x)
ax.set_xticklabels(labels, rotation=15)
ax.legend(loc='upper left', framealpha=0.8, facecolor=COLORS['card'])
ax.grid(axis='y', alpha=0.3)

# Add value labels on bars
for bars in [bars1, bars2, bars3, bars4]:
    for bar in bars:
        h = bar.get_height()
        if h > 0:
            ax.text(bar.get_x() + bar.get_width()/2., h + 5, f'{h:.0f}',
                    ha='center', va='bottom', fontsize=7, color=COLORS['text'])

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'stress_summary_statistics.png'), dpi=150, bbox_inches='tight')
plt.close(fig)
print("  -> Saved: stress_summary_statistics.png")


# --- Chart 3: Response Time Over Time (Line Chart per report) ---
print("Generating Chart 3: Response Time Over Time...")
fig, axes = plt.subplots(2, 3, figsize=(18, 10))
axes = axes.flatten()

for idx, (label, rdata) in enumerate(all_reports.items()):
    if idx >= 6:
        break
    ax = axes[idx]
    durations = rdata['durations']
    if not durations:
        continue

    # Get timestamps as relative seconds
    timestamps = [parse_timestamp(d[0]) for d in durations]
    values = [d[1] for d in durations]

    if timestamps:
        t_min = min(timestamps)
        rel_times = [(t - t_min) for t in timestamps]

        # Bin into 1-second intervals for smoothing
        max_time = max(rel_times) if rel_times else 1
        n_bins = min(200, max(50, int(max_time)))
        bins = np.linspace(0, max_time, n_bins)
        bin_means = []
        bin_centers = []

        for i in range(len(bins) - 1):
            mask = [(t >= bins[i] and t < bins[i+1]) for t in rel_times]
            bin_vals = [v for v, m in zip(values, mask) if m]
            if bin_vals:
                bin_means.append(np.mean(bin_vals))
                bin_centers.append((bins[i] + bins[i+1]) / 2)

        color = box_colors[idx % len(box_colors)]
        ax.plot(bin_centers, bin_means, color=color, linewidth=1.5, alpha=0.9)
        ax.fill_between(bin_centers, bin_means, alpha=0.15, color=color)

        ax.set_title(label, fontsize=12, fontweight='bold')
        ax.set_xlabel('Time (s)', fontsize=9)
        ax.set_ylabel('Resp. Time (ms)', fontsize=9)
        ax.grid(alpha=0.2)
        ax.tick_params(labelsize=8)

fig.suptitle('Response Time Over Time per Endpoint Group\n(Stress Test - k6)', fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'stress_response_time_over_time.png'), dpi=150, bbox_inches='tight')
plt.close(fig)
print("  -> Saved: stress_response_time_over_time.png")


# --- Chart 4: Request Count & Error Rate Summary ---
print("Generating Chart 4: Request Count & Error Rate...")
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

report_labels = []
total_reqs = []
error_rates = []

for label, rdata in all_reports.items():
    report_labels.append(label)
    total_reqs.append(len(rdata['req_counts']))
    fail_vals = [f[1] for f in rdata['failures']]
    err_rate = (sum(fail_vals) / len(fail_vals) * 100) if fail_vals else 0
    error_rates.append(err_rate)

# Total requests bar
bars = ax1.barh(report_labels, total_reqs, color=box_colors[:len(report_labels)], alpha=0.85, edgecolor='none')
ax1.set_title('Total HTTP Requests', fontsize=14, fontweight='bold')
ax1.set_xlabel('Jumlah Request', fontsize=12)
for bar, val in zip(bars, total_reqs):
    ax1.text(bar.get_width() + max(total_reqs)*0.01, bar.get_y() + bar.get_height()/2,
             f'{val:,}', ha='left', va='center', fontsize=10, color=COLORS['text'])

# Error rate bar
bar_colors = [COLORS['success'] if e < 1 else (COLORS['warning'] if e < 5 else COLORS['danger']) for e in error_rates]
bars2 = ax2.barh(report_labels, error_rates, color=bar_colors, alpha=0.85, edgecolor='none')
ax2.set_title('Error Rate (%)', fontsize=14, fontweight='bold')
ax2.set_xlabel('Error Rate (%)', fontsize=12)
for bar, val in zip(bars2, error_rates):
    ax2.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2,
             f'{val:.2f}%', ha='left', va='center', fontsize=10,
             color=COLORS['success'] if val < 1 else COLORS['danger'])

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'stress_request_error_summary.png'), dpi=150, bbox_inches='tight')
plt.close(fig)
print("  -> Saved: stress_request_error_summary.png")


# ============================================================
# 2. UNIT TEST COVERAGE CHARTS
# ============================================================
print("\n" + "=" * 60)
print("Processing Unit Test Coverage...")
print("=" * 60)

with open(COVERAGE_FILE, 'r', encoding='utf-8') as f:
    coverage_data = json.load(f)

BASE_PATH = r"D:\Perkuliahan\Work Order\workorder-portal\src"

module_coverage = {}
for filepath, file_cov in coverage_data.items():
    # Extract module name
    rel = filepath.replace(BASE_PATH + "\\", "").replace("/", "\\")
    module = rel.split("\\")[0]

    if module not in module_coverage:
        module_coverage[module] = {
            'statements_total': 0, 'statements_covered': 0,
            'branches_total': 0, 'branches_covered': 0,
            'functions_total': 0, 'functions_covered': 0,
            'lines_total': 0, 'lines_covered': 0,
            'files': 0,
        }

    mc = module_coverage[module]
    mc['files'] += 1

    # Statements
    s_map = file_cov.get('s', {})
    mc['statements_total'] += len(s_map)
    mc['statements_covered'] += sum(1 for v in s_map.values() if v > 0)

    # Branches
    b_map = file_cov.get('b', {})
    for branch_id, locations in b_map.items():
        mc['branches_total'] += len(locations)
        mc['branches_covered'] += sum(1 for v in locations if v > 0)

    # Functions
    f_map = file_cov.get('f', {})
    mc['functions_total'] += len(f_map)
    mc['functions_covered'] += sum(1 for v in f_map.values() if v > 0)

# Calculate percentages
for mod, mc in module_coverage.items():
    mc['stmt_pct'] = (mc['statements_covered'] / mc['statements_total'] * 100) if mc['statements_total'] > 0 else 0
    mc['branch_pct'] = (mc['branches_covered'] / mc['branches_total'] * 100) if mc['branches_total'] > 0 else 0
    mc['func_pct'] = (mc['functions_covered'] / mc['functions_total'] * 100) if mc['functions_total'] > 0 else 0

# Sort by statement coverage
sorted_modules = sorted(module_coverage.items(), key=lambda x: x[1]['stmt_pct'], reverse=True)

print(f"  Found {len(sorted_modules)} modules")
for mod, mc in sorted_modules:
    print(f"    {mod}: Stmt={mc['stmt_pct']:.1f}% Branch={mc['branch_pct']:.1f}% Func={mc['func_pct']:.1f}% ({mc['files']} files)")


# --- Chart 5: Coverage per Module (Grouped Bar) ---
print("\nGenerating Chart 5: Coverage per Module...")
fig, ax = plt.subplots(figsize=(16, 8))

mod_labels = [m[0] for m in sorted_modules]
stmt_pcts = [m[1]['stmt_pct'] for m in sorted_modules]
branch_pcts = [m[1]['branch_pct'] for m in sorted_modules]
func_pcts = [m[1]['func_pct'] for m in sorted_modules]

x = np.arange(len(mod_labels))
width = 0.25

bars1 = ax.bar(x - width, stmt_pcts, width, label='Statements', color=COLORS['accent1'], alpha=0.85)
bars2 = ax.bar(x, branch_pcts, width, label='Branches', color=COLORS['accent4'], alpha=0.85)
bars3 = ax.bar(x + width, func_pcts, width, label='Functions', color=COLORS['accent3'], alpha=0.85)

ax.set_title('Unit Test Coverage per Module\n(Statements / Branches / Functions)', fontsize=16, fontweight='bold', pad=15)
ax.set_ylabel('Coverage (%)', fontsize=13)
ax.set_xlabel('Module', fontsize=13)
ax.set_xticks(x)
ax.set_xticklabels(mod_labels, rotation=45, ha='right', fontsize=9)
ax.legend(loc='upper right', framealpha=0.8, facecolor=COLORS['card'])
ax.grid(axis='y', alpha=0.3)
ax.set_ylim(0, 110)
ax.axhline(y=80, color=COLORS['success'], linestyle='--', alpha=0.5, label='Target 80%')
ax.axhline(y=50, color=COLORS['warning'], linestyle='--', alpha=0.5)

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'unit_coverage_per_module.png'), dpi=150, bbox_inches='tight')
plt.close(fig)
print("  -> Saved: unit_coverage_per_module.png")


# --- Chart 6: Overall Coverage Summary (Donut Charts) ---
print("Generating Chart 6: Overall Coverage Summary...")
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

total_stmts = sum(mc['statements_total'] for _, mc in sorted_modules)
covered_stmts = sum(mc['statements_covered'] for _, mc in sorted_modules)
total_branches = sum(mc['branches_total'] for _, mc in sorted_modules)
covered_branches = sum(mc['branches_covered'] for _, mc in sorted_modules)
total_funcs = sum(mc['functions_total'] for _, mc in sorted_modules)
covered_funcs = sum(mc['functions_covered'] for _, mc in sorted_modules)

summaries = [
    ('Statements', covered_stmts, total_stmts, COLORS['accent1']),
    ('Branches', covered_branches, total_branches, COLORS['accent4']),
    ('Functions', covered_funcs, total_funcs, COLORS['accent3']),
]

for ax, (title, covered, total, color) in zip(axes, summaries):
    pct = (covered / total * 100) if total > 0 else 0
    uncovered = total - covered

    wedges, _ = ax.pie(
        [covered, uncovered],
        colors=[color, COLORS['grid']],
        startangle=90,
        wedgeprops=dict(width=0.35, edgecolor=COLORS['bg'], linewidth=2),
    )

    ax.text(0, 0, f'{pct:.1f}%', ha='center', va='center',
            fontsize=24, fontweight='bold', color=color)
    ax.set_title(f'{title}\n({covered}/{total})', fontsize=13, fontweight='bold', pad=10)

fig.suptitle('Overall Unit Test Coverage Summary', fontsize=16, fontweight='bold', y=1.05)
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'unit_coverage_summary.png'), dpi=150, bbox_inches='tight')
plt.close(fig)
print("  -> Saved: unit_coverage_summary.png")


# --- Chart 7: Coverage Heatmap ---
print("Generating Chart 7: Coverage Heatmap...")
fig, ax = plt.subplots(figsize=(10, max(6, len(sorted_modules) * 0.4)))

heatmap_data = np.array([[m[1]['stmt_pct'], m[1]['branch_pct'], m[1]['func_pct']] for m in sorted_modules])
im = ax.imshow(heatmap_data, cmap='RdYlGn', aspect='auto', vmin=0, vmax=100)

ax.set_xticks([0, 1, 2])
ax.set_xticklabels(['Statements', 'Branches', 'Functions'], fontsize=11)
ax.set_yticks(range(len(sorted_modules)))
ax.set_yticklabels([m[0] for m in sorted_modules], fontsize=9)

# Add text annotations
for i in range(len(sorted_modules)):
    for j in range(3):
        val = heatmap_data[i, j]
        text_color = '#000000' if val > 50 else '#FFFFFF'
        ax.text(j, i, f'{val:.0f}%', ha='center', va='center',
                fontsize=9, fontweight='bold', color=text_color)

ax.set_title('Coverage Heatmap per Module (%)\nHijau = tinggi, Merah = rendah', fontsize=14, fontweight='bold', pad=15)

cbar = plt.colorbar(im, ax=ax, shrink=0.8)
cbar.set_label('Coverage %', fontsize=11)
cbar.ax.tick_params(colors=COLORS['text'])

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'unit_coverage_heatmap.png'), dpi=150, bbox_inches='tight')
plt.close(fig)
print("  -> Saved: unit_coverage_heatmap.png")


# ============================================================
# DONE
# ============================================================
print("\n" + "=" * 60)
print(f"All charts saved to: {OUTPUT_DIR}")
print("=" * 60)
print("\nGenerated files:")
for f in sorted(os.listdir(OUTPUT_DIR)):
    if f.endswith('.png'):
        fpath = os.path.join(OUTPUT_DIR, f)
        size_kb = os.path.getsize(fpath) / 1024
        print(f"  {f} ({size_kb:.1f} KB)")
