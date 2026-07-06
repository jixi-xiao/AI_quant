// assets/charts.js — Performance comparison charts
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var green = style.getPropertyValue('--green').trim();
  var red = style.getPropertyValue('--red').trim();

  // --- Chart: 策略累计收益 vs 买入持有基准对比 ---
  var chartPerf = echarts.init(document.getElementById('chart-perf-compare'), null, { renderer: 'svg' });
  chartPerf.setOption({
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12, fontFamily: 'sans-serif' },
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        var html = '<strong>' + params[0].axisValue + '</strong><br/>';
        params.forEach(function(p) {
          html += '<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + p.color + ';margin-right:6px"></span>';
          html += p.seriesName + ': ' + (p.value >= 0 ? '+' : '') + p.value.toFixed(2) + '%<br/>';
        });
        return html;
      }
    },
    legend: {
      top: 0,
      textStyle: { color: muted, fontSize: 12, fontFamily: 'sans-serif' },
      itemWidth: 14,
      itemHeight: 10
    },
    grid: {
      left: '3%',
      right: '5%',
      top: 36,
      bottom: 12,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['宁德时代', '阳光电源'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif' },
      nameTextStyle: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '累计收益率 (%)',
      nameTextStyle: { color: muted, fontSize: 11, fontFamily: 'sans-serif' },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: {
        color: muted,
        fontSize: 11,
        fontFamily: 'sans-serif',
        formatter: function(v) { return v >= 0 ? '+' + v.toFixed(0) + '%' : v.toFixed(0) + '%'; }
      }
    },
    series: [
      {
        name: '策略收益',
        type: 'bar',
        data: [410.20, 5688.29],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '88' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barGap: '20%',
        label: {
          show: true,
          position: 'top',
          color: accent,
          fontSize: 11,
          fontWeight: 600,
          fontFamily: 'sans-serif',
          formatter: function(p) { return '+' + p.value.toFixed(1) + '%'; }
        }
      },
      {
        name: '基准收益',
        type: 'bar',
        data: [1026.62, 4858.40],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent2 },
            { offset: 1, color: accent2 + '88' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: accent2,
          fontSize: 11,
          fontWeight: 600,
          fontFamily: 'sans-serif',
          formatter: function(p) { return '+' + p.value.toFixed(1) + '%'; }
        }
      }
    ],
    animation: false
  });

  window.addEventListener('resize', function() { chartPerf.resize(); });
})();