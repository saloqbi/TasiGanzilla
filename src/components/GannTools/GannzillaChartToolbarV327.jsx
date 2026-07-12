import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const BUILD = 327;
const PANEL_STATE_KEY = 'tasi-gannzilla-canonical-panel-v326';
const CHARTS_KEY = 'tasi-gannzilla-chart-registry-v327';
const ACTIVE_KEY = 'tasi-gannzilla-active-chart-v327';

const clone = (value) => JSON.parse(JSON.stringify(value));

function readCurrentPanelState() {
  try {
    const runtime = window.__gannzillaCanonicalPanelStateV326;
    if (runtime && typeof runtime === 'object') return clone(runtime);
    const saved = JSON.parse(localStorage.getItem(PANEL_STATE_KEY) || 'null');
    return saved && typeof saved === 'object' ? saved : {};
  } catch (_) {
    return {};
  }
}

function defaultCharts() {
  return [{ id: 'default', name: 'Default', state: readCurrentPanelState() }];
}

function loadCharts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHARTS_KEY) || 'null');
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultCharts();
    return parsed
      .filter((chart) => chart && chart.id && chart.name && chart.state && typeof chart.state === 'object')
      .map((chart) => ({ id: String(chart.id), name: String(chart.name), state: clone(chart.state) }));
  } catch (_) {
    return defaultCharts();
  }
}

function loadActiveId(charts) {
  const saved = localStorage.getItem(ACTIVE_KEY);
  return charts.some((chart) => chart.id === saved) ? saved : charts[0].id;
}

function isTypingTarget(target) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLSelectElement
    || target instanceof HTMLTextAreaElement
    || target?.isContentEditable === true;
}

const buttonBase = {
  minWidth: 25,
  height: 24,
  padding: '0 5px',
  border: '1px solid #a8a8a8',
  borderRadius: 2,
  background: '#f7f7f7',
  color: '#222',
  fontFamily: 'Tahoma, Segoe UI, Arial, sans-serif',
  fontSize: 13,
  fontWeight: 800,
  lineHeight: '22px',
  cursor: 'pointer',
};

export default function GannzillaChartToolbarV327() {
  const [header, setHeader] = useState(null);
  const [charts, setCharts] = useState(loadCharts);
  const [activeId, setActiveId] = useState(() => loadActiveId(loadCharts()));
  const [savedFlash, setSavedFlash] = useState(false);
  const ar = useMemo(() => {
    try { return new URLSearchParams(window.location.search).get('lang') !== 'en'; }
    catch (_) { return true; }
  }, []);
  const t = (arabic, english) => (ar ? arabic : english);

  useEffect(() => {
    let cancelled = false;
    const findHeader = () => {
      if (cancelled) return;
      const node = document.querySelector('.gannzilla-canonical-property-panel-v326 > div:first-child');
      if (node) setHeader(node);
      else window.setTimeout(findHeader, 50);
    };
    findHeader();
    return () => { cancelled = true; };
  }, []);

  const persistRegistry = (nextCharts, nextActiveId = activeId) => {
    localStorage.setItem(CHARTS_KEY, JSON.stringify(nextCharts));
    localStorage.setItem(ACTIVE_KEY, nextActiveId);
  };

  const saveActive = (showFeedback = true) => {
    const currentState = readCurrentPanelState();
    const nextCharts = charts.map((chart) => (
      chart.id === activeId ? { ...chart, state: currentState } : chart
    ));
    setCharts(nextCharts);
    persistRegistry(nextCharts, activeId);
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(currentState));
    if (showFeedback) {
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1400);
    }
    window.__gannzillaLastChartToolbarActionV327 = { action: 'save', activeId, at: Date.now() };
    return nextCharts;
  };

  const switchChart = (nextId) => {
    if (nextId === activeId) return;
    const currentState = readCurrentPanelState();
    const nextCharts = charts.map((chart) => (
      chart.id === activeId ? { ...chart, state: currentState } : chart
    ));
    const target = nextCharts.find((chart) => chart.id === nextId);
    if (!target) return;
    persistRegistry(nextCharts, nextId);
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(target.state));
    window.__gannzillaLastChartToolbarActionV327 = { action: 'switch', activeId: nextId, at: Date.now() };
    window.location.reload();
  };

  const addChart = () => {
    const suggested = t(`مخطط ${charts.length + 1}`, `Chart ${charts.length + 1}`);
    const entered = window.prompt(t('اسم المخطط الجديد', 'New chart name'), suggested);
    const name = String(entered || '').trim();
    if (!name) return;
    const id = `chart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nextCharts = [...charts, { id, name, state: readCurrentPanelState() }];
    setCharts(nextCharts);
    setActiveId(id);
    persistRegistry(nextCharts, id);
    window.__gannzillaLastChartToolbarActionV327 = { action: 'add', activeId: id, at: Date.now() };
  };

  const deleteChart = () => {
    if (charts.length <= 1) {
      window.alert(t('لا يمكن حذف آخر مخطط.', 'The last chart cannot be deleted.'));
      return;
    }
    const active = charts.find((chart) => chart.id === activeId);
    if (!window.confirm(t(`حذف المخطط «${active?.name || ''}»؟`, `Delete chart “${active?.name || ''}”?`))) return;
    const nextCharts = charts.filter((chart) => chart.id !== activeId);
    const nextActive = nextCharts[0];
    persistRegistry(nextCharts, nextActive.id);
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(nextActive.state));
    window.__gannzillaLastChartToolbarActionV327 = { action: 'delete', activeId, at: Date.now() };
    window.location.reload();
  };

  const renameChart = () => {
    const active = charts.find((chart) => chart.id === activeId);
    if (!active) return;
    const entered = window.prompt(t('اسم المخطط', 'Chart name'), active.name);
    const name = String(entered || '').trim();
    if (!name || name === active.name) return;
    const nextCharts = charts.map((chart) => (chart.id === activeId ? { ...chart, name } : chart));
    setCharts(nextCharts);
    persistRegistry(nextCharts, activeId);
    window.__gannzillaLastChartToolbarActionV327 = { action: 'rename', activeId, at: Date.now() };
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isTypingTarget(event.target)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveActive(true);
      } else if (event.key === 'F2') {
        event.preventDefault();
        renameChart();
      } else if (event.key === 'Insert') {
        event.preventDefault();
        addChart();
      } else if (event.key === 'Delete') {
        event.preventDefault();
        deleteChart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [charts, activeId, ar]);

  useEffect(() => {
    window.GANNZILLA_CHART_TOOLBAR_V327 = true;
    window.__auditGannzillaChartToolbarV327 = () => ({
      ok: Boolean(header) && charts.length > 0 && charts.some((chart) => chart.id === activeId),
      build: BUILD,
      headerMounted: Boolean(header),
      chartCount: charts.length,
      activeChartId: activeId,
      addEnabled: true,
      deleteEnabled: true,
      renameEnabled: true,
      saveEnabled: true,
      switchEnabled: true,
      autoSaveBeforeSwitch: true,
      keyboardShortcuts: ['Insert', 'Delete', 'F2', 'Ctrl+S'],
      lastAction: window.__gannzillaLastChartToolbarActionV327 || null,
    });
    return () => {
      delete window.GANNZILLA_CHART_TOOLBAR_V327;
      delete window.__auditGannzillaChartToolbarV327;
      delete window.__gannzillaLastChartToolbarActionV327;
    };
  }, [header, charts, activeId]);

  if (!header) return null;

  return createPortal(
    <>
      <style>{`
        .gannzilla-canonical-property-panel-v326 > div:first-child > span,
        .gannzilla-canonical-property-panel-v326 > div:first-child > button,
        .gannzilla-canonical-property-panel-v326 > div:first-child > input {
          display: none !important;
        }
        .gannzilla-chart-toolbar-v327 button:hover {
          background: #ffffff !important;
          border-color: #777 !important;
        }
        .gannzilla-chart-toolbar-v327 button:active {
          transform: translateY(1px);
        }
      `}</style>
      <div
        className="gannzilla-chart-toolbar-v327"
        dir={ar ? 'rtl' : 'ltr'}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}
      >
        <select
          aria-label={t('اختيار المخطط', 'Select chart')}
          title={t('اختيار المخطط', 'Select chart')}
          value={activeId}
          onChange={(event) => switchChart(event.target.value)}
          style={{ flex: 1, minWidth: 90, height: 24, border: '1px solid #aaa', background: '#fff', fontFamily: 'inherit', fontWeight: 700 }}
        >
          {charts.map((chart) => <option key={chart.id} value={chart.id}>{chart.name}</option>)}
        </select>

        <button type="button" onClick={addChart} title={t('إضافة مخطط — Insert', 'Add chart — Insert')} aria-label={t('إضافة مخطط', 'Add chart')} style={{ ...buttonBase, color: '#149b35' }}>＋ {t('إضافة', 'Add')}</button>
        <button type="button" onClick={deleteChart} title={t('حذف المخطط — Delete', 'Delete chart — Delete')} aria-label={t('حذف المخطط', 'Delete chart')} style={{ ...buttonBase, color: '#cc2525', minWidth: 26 }}>−</button>
        <button type="button" onClick={renameChart} title={t('إعادة تسمية المخطط — F2', 'Rename chart — F2')} aria-label={t('إعادة تسمية المخطط', 'Rename chart')} style={{ ...buttonBase, minWidth: 28 }}>✎</button>
        <button type="button" onClick={() => saveActive(true)} title={t('حفظ المخطط — Ctrl+S', 'Save chart — Ctrl+S')} aria-label={t('حفظ المخطط', 'Save chart')} style={{ ...buttonBase, minWidth: 28, color: savedFlash ? '#159447' : '#333' }}>{savedFlash ? '✓' : '▣'}</button>
      </div>
    </>,
    header,
  );
}
