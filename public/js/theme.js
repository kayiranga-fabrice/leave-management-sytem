// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    // Update charts if they exist
    if (window.productionChart) {
        updateChartTheme(window.productionChart);
    }
    if (window.yieldChart) {
        updateChartTheme(window.yieldChart);
    }
    if (window.productionTrendChart) {
        updateChartTheme(window.productionTrendChart);
    }
    if (window.qualityDistributionChart) {
        updateChartTheme(window.qualityDistributionChart);
    }
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    }
}

function updateChartTheme(chart) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e9ecef' : '#212529';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    if (chart.options.scales) {
        // Update scales
        Object.values(chart.options.scales).forEach(scale => {
            if (scale.ticks) {
                scale.ticks.color = textColor;
            }
            if (scale.grid) {
                scale.grid.color = gridColor;
            }
        });
    }

    // Update legend
    if (chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = textColor;
    }

    chart.update();
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initTheme);
