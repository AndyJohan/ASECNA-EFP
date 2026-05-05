import { useEffect, useMemo, useState } from 'react';
import {
  categoryBreakdown as fallbackCategoryBreakdown,
  pannesParEquipement as fallbackPannes,
} from '../data';
import ImportToolbar from '../components/ImportToolbar';
import { useHistoriqueData } from '../hooks/useHistoriqueData';
import { exportHistoriqueSummaryPdf } from '../utils/historiquePdf';

const GRAPH_DIMENSIONS = {
  width: 620,
  height: 220,
  paddingTop: 16,
  paddingRight: 20,
  paddingBottom: 28,
  paddingLeft: 46,
};

const Y_AXIS_TICKS = [0, 2, 4, 6, 8, 10];

const MONTH_OPTIONS = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Fevrier' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Aout' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Decembre' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2009 + 1 },
  (_, index) => String(CURRENT_YEAR - index),
);

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Toutes les categories' },
  { value: 'COM', label: 'COM' },
  { value: 'SURV', label: 'SURV' },
  { value: 'MET', label: 'MET' },
  { value: 'RESEAU', label: 'RESEAU' },
];

function formatMonthLabel(period) {
  if (!period) return 'Mois: --';
  const date = new Date(period);
  if (Number.isNaN(date.getTime())) return `Mois: ${period}`;
  return `Mois: ${date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
}

function buildStepPaths(points, dimensions) {
  const maxValue = Math.max(10, ...points.map((point) => point.value));
  const step =
    (dimensions.width - dimensions.paddingLeft - dimensions.paddingRight) /
    (points.length - 1 || 1);

  const coords = points.map((point, index) => {
    const x = dimensions.paddingLeft + index * step;
    const normalized = point.value / maxValue;
    const y =
      dimensions.height -
      dimensions.paddingBottom -
      normalized * (dimensions.height - dimensions.paddingTop - dimensions.paddingBottom);

    return { ...point, x, y };
  });

  let line = '';
  coords.forEach((coord, index) => {
    if (index === 0) {
      line += `M ${coord.x} ${coord.y}`;
      return;
    }

    const prev = coords[index - 1];
    line += ` L ${coord.x} ${prev.y} L ${coord.x} ${coord.y}`;
  });

  const area = `${line} L ${dimensions.width - dimensions.paddingRight} ${
    dimensions.height - dimensions.paddingBottom
  } L ${dimensions.paddingLeft} ${dimensions.height - dimensions.paddingBottom} Z`;

  return { line, area, coords, maxValue };
}

function getDaysInMonth(year, month) {
  return new Date(Number(year), Number(month), 0).getDate();
}

function buildMonthlyTrend(trend, year, month) {
  if (!year || !month) {
    return trend;
  }

  const totalDays = getDaysInMonth(year, month);
  const trendByDay = new Map(
    trend.map((point) => [String(point.label).padStart(2, '0'), point.value]),
  );

  return Array.from({ length: totalDays }, (_, index) => {
    const dayLabel = String(index + 1).padStart(2, '0');
    return {
      label: dayLabel,
      value: trendByDay.get(dayLabel) ?? 0,
    };
  });
}

function buildDateFromSelection(year, month, dayLabel) {
  if (!year || !month || !dayLabel) {
    return null;
  }

  return `${year}-${month}-${dayLabel}`;
}

function normalizeApiDate(value) {
  if (!value) {
    return null;
  }

  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeDonutArc(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
  const safeEndAngle = endAngle - 0.0001;
  const outerStart = polarToCartesian(cx, cy, outerRadius, safeEndAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, safeEndAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function HistoriquePage() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState(null);
  const [selectedDayLabel, setSelectedDayLabel] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const selectedPeriod =
    selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}` : undefined;
  const { summary, details, loading, error, reload } = useHistoriqueData(
    selectedPeriod,
    selectedCategory,
  );

  const trend = useMemo(() => (summary?.trend?.length ? summary.trend : []), [summary]);
  const categoryBreakdown =
    summary?.categoryBreakdown?.length ? summary.categoryBreakdown : fallbackCategoryBreakdown;
  const pannesParEquipement =
    summary?.pannesParEquipement?.length ? summary.pannesParEquipement : fallbackPannes;
  const historiquePannes = details;

  const fullTrend = useMemo(
    () => buildMonthlyTrend(trend, selectedYear, selectedMonth),
    [selectedMonth, selectedYear, trend],
  );

  const selectedDate = useMemo(
    () => buildDateFromSelection(selectedYear, selectedMonth, selectedDayLabel),
    [selectedDayLabel, selectedMonth, selectedYear],
  );

  const selectedDayDetails = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return historiquePannes.filter((item) => normalizeApiDate(item.date) === selectedDate);
  }, [historiquePannes, selectedDate]);

  useEffect(() => {
    if (!summary?.period || (selectedMonth && selectedYear)) {
      return;
    }

    const [year, month] = String(summary.period).slice(0, 7).split('-');
    if (year && month) {
      setSelectedYear(year);
      setSelectedMonth(month);
    }
  }, [selectedMonth, selectedYear, summary?.period]);

  useEffect(() => {
    if (!fullTrend.length) {
      setSelectedDayLabel(null);
      return;
    }

    if (!selectedDayLabel || !fullTrend.some((point) => point.label === selectedDayLabel)) {
      const firstNonZeroPoint = fullTrend.find((point) => point.value > 0);
      setSelectedDayLabel(firstNonZeroPoint?.label ?? fullTrend[0].label);
    }
  }, [fullTrend, selectedDayLabel]);

  const linePaths = useMemo(() => {
    if (!fullTrend.length) {
      return buildStepPaths(
        [
          { label: 'J1', value: 0 },
          { label: 'J2', value: 0 },
        ],
        GRAPH_DIMENSIONS,
      );
    }

    return buildStepPaths(fullTrend, GRAPH_DIMENSIONS);
  }, [fullTrend]);

  const yAxisGuides = useMemo(
    () =>
      Y_AXIS_TICKS.map((tick) => {
        const y =
          GRAPH_DIMENSIONS.height -
          GRAPH_DIMENSIONS.paddingBottom -
          (tick / linePaths.maxValue) *
            (GRAPH_DIMENSIONS.height - GRAPH_DIMENSIONS.paddingTop - GRAPH_DIMENSIONS.paddingBottom);

        return { tick, y };
      }),
    [linePaths.maxValue],
  );

  const donutSlices = useMemo(() => {
    const outerRadius = 84;
    const innerRadius = 56;
    const center = 110;
    let currentAngle = -90;

    return categoryBreakdown.map((item, index) => {
      const percentage = Number(item.value || 0);
      const angleSize = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSize;
      currentAngle = endAngle;

      const isHovered = hoveredDonutIndex === index;
      const middleAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);

      return {
        ...item,
        index,
        isHovered,
        path: describeDonutArc(
          center,
          center,
          outerRadius,
          innerRadius,
          startAngle,
          endAngle,
        ),
        tooltipX: center + Math.cos(middleAngle) * (outerRadius + 22),
        tooltipY: center + Math.sin(middleAngle) * (outerRadius + 22),
      };
    });
  }, [categoryBreakdown, hoveredDonutIndex]);

  const activeDonutSlice =
    hoveredDonutIndex !== null
      ? donutSlices[hoveredDonutIndex] ?? null
      : categoryBreakdown[0] ?? null;

  const activePeriod = selectedPeriod || String(summary?.period || '').slice(0, 7) || undefined;

  const handleExportPdf = async () => {
    if (loading || !activePeriod || isExportingPdf) {
      return;
    }

    try {
      setIsExportingPdf(true);
      await exportHistoriqueSummaryPdf({
        period: activePeriod,
        category: selectedCategory,
        summary,
        details: historiquePannes,
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <section className="section page-historique">
      <header className="topbar">
        <div>
          <p className="eyebrow">Historique</p>
          <h1>Historique des pannes</h1>
        </div>
        <div className="topbar-actions">
          <ImportToolbar onSuccess={reload} />
          <button className="ghost-button">Exporter</button>
          <button className="primary-button">Nouvelle analyse</button>
        </div>
      </header>

      <div className="section-header">
        <div>
          <h2>Vue mensuelle</h2>
          <p className="muted">{formatMonthLabel(summary?.period)}</p>
        </div>
        <div className="historique-toolbar-actions">
          <div className="period-filter">
            <div className="period-filter-group">
              <label className="muted" htmlFor="mois-select">
                Mois
              </label>
              <select
                id="mois-select"
                className="period-select"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              >
                <option value="">Choisir</option>
                {MONTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="period-filter-group">
              <label className="muted" htmlFor="annee-select">
                Annee
              </label>
              <select
                id="annee-select"
                className="period-select"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
              >
                <option value="">Choisir</option>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="period-filter-group">
              <label className="muted" htmlFor="categorie-select">
                Categorie
              </label>
              <select
                id="categorie-select"
                className="period-select"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="ghost-button"
            type="button"
            onClick={handleExportPdf}
            disabled={loading || !activePeriod || isExportingPdf}
          >
            {isExportingPdf ? 'Export PDF...' : 'Exporter PDF'}
          </button>
        </div>
        <div className="pill">
          {loading
            ? 'Chargement...'
            : error
              ? "Erreur de chargement de l'API"
              : 'Donnees issues de la base (connecte)'}
        </div>
      </div>

      <div className="grid-2">
        <div className="card large">
          <div className="card-header">
            <div>
              <h3>Evolution des pannes</h3>
              <span className="muted">{fullTrend.length} jours sur la periode</span>
            </div>
            <div className="legend">
              <span className="legend-dot"></span>
              <span>Pannes / jour</span>
            </div>
          </div>
          <div className="chart">
            <svg
              width={GRAPH_DIMENSIONS.width}
              height={GRAPH_DIMENSIONS.height}
              viewBox={`0 0 ${GRAPH_DIMENSIONS.width} ${GRAPH_DIMENSIONS.height}`}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9bb4ff" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {yAxisGuides.map((guide) => (
                <g key={guide.tick}>
                  <line
                    x1={GRAPH_DIMENSIONS.paddingLeft}
                    y1={guide.y}
                    x2={GRAPH_DIMENSIONS.width - GRAPH_DIMENSIONS.paddingRight}
                    y2={guide.y}
                    stroke="rgba(148, 163, 184, 0.18)"
                    strokeDasharray="4 6"
                  />
                  <text
                    x={GRAPH_DIMENSIONS.paddingLeft - 10}
                    y={guide.y + 4}
                    textAnchor="end"
                    className="chart-axis-label"
                  >
                    {guide.tick}
                  </text>
                </g>
              ))}
              <path d={linePaths.area} fill="url(#areaGradient)" />
              <path
                d={linePaths.line}
                fill="none"
                stroke="#cbd5f5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {linePaths.coords.map((point) => (
                <g key={`point-${point.label}`}>
                  {hoveredPoint?.label === point.label && (
                    <>
                      <circle cx={point.x} cy={point.y} r={10} className="chart-point-glow" />
                      <circle cx={point.x} cy={point.y} r={4.5} className="chart-point-active" />
                    </>
                  )}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={9}
                    className="chart-point-hitbox"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => setSelectedDayLabel(point.label)}
                  />
                </g>
              ))}
            </svg>
            <div className="chart-annotation">
              <p>Pic de pannes</p>
              <strong>
                {fullTrend.length ? Math.max(...fullTrend.map((point) => point.value)) : 0} alertes
              </strong>
            </div>
            {hoveredPoint && (
              <div
                className="chart-tooltip"
                style={{
                  left: `${(hoveredPoint.x / GRAPH_DIMENSIONS.width) * 100}%`,
                  top: `${(hoveredPoint.y / GRAPH_DIMENSIONS.height) * 100}%`,
                }}
              >
                <strong>
                  {hoveredPoint.value} panne{hoveredPoint.value > 1 ? 's' : ''}
                </strong>
                <span>Jour {hoveredPoint.label}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Details du jour</h3>
            <span className="muted">
              {selectedDate ? `Jour selectionne : ${selectedDate}` : 'Clique sur un pic du graphe'}
            </span>
          </div>
          <div className="day-details-list">
            {selectedDayDetails.length ? (
              selectedDayDetails.map((item, index) => (
                <div
                  key={`${item.equipement}-${item.date}-${item.heure ?? 'sans-heure'}-${index}`}
                  className="day-details-row"
                >
                  <div>
                    <span className="muted">Equipement</span>
                    <strong>{item.equipement ?? '—'}</strong>
                    <span className="detail-category-badge">
                      {item.categorie ?? 'Non renseignee'}
                    </span>
                  </div>
                  <div>
                    <span className="muted">Heure</span>
                    <strong>{item.heure ?? '—'}</strong>
                  </div>
                  <div>
                    <span className="muted">Date</span>
                    <strong>{item.date ?? '—'}</strong>
                  </div>
                  <div>
                    <span className="muted">Statut</span>
                    <strong>{item.commentaires ?? 'Panne'}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="day-details-empty">
                <strong>Aucune panne pour ce jour</strong>
                <span className="muted">Selectionne un autre pic pour voir les details.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Pannes par equipement</h3>
            <span className="muted">Top 5 sur la periode</span>
          </div>
          <div className="bars">
            {pannesParEquipement.map((item) => (
              <div key={item.equipement} className="bar-row">
                <span>{item.equipement}</span>
                <div className="bar">
                  <div style={{ width: `${Math.min(item.pannes * 8, 100)}%` }}></div>
                </div>
                <strong>{item.pannes}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Taux de pannes par categories</h3>
            <span className="muted">Repartition du mois selectionne</span>
          </div>
          <div className="donut-wrapper">
            <svg
              className="donut-svg"
              viewBox="0 0 220 220"
              role="img"
              aria-label="Repartition des pannes par categories"
            >
              <circle className="donut-track" cx="110" cy="110" r="70" />
              {donutSlices.map((slice) => (
                <path
                  key={slice.label}
                  d={slice.path}
                  fill={slice.color}
                  className={`donut-segment${slice.isHovered ? ' is-hovered' : ''}`}
                  onMouseEnter={() => setHoveredDonutIndex(slice.index)}
                  onMouseLeave={() => setHoveredDonutIndex(null)}
                />
              ))}
            </svg>
            <div className="donut-center">
              <strong>{activeDonutSlice?.value ?? 0}%</strong>
              <span className="muted">{activeDonutSlice?.label ?? 'Categorie'}</span>
            </div>
            {hoveredDonutIndex !== null && donutSlices[hoveredDonutIndex] ? (
              <div
                className="donut-tooltip"
                style={{
                  left: `${(donutSlices[hoveredDonutIndex].tooltipX / 220) * 100}%`,
                  top: `${(donutSlices[hoveredDonutIndex].tooltipY / 220) * 100}%`,
                }}
              >
                <strong>{donutSlices[hoveredDonutIndex].label}</strong>
                <span>{donutSlices[hoveredDonutIndex].value}%</span>
              </div>
            ) : null}
          </div>
          <div className="donut-legend">
            {categoryBreakdown.map((item) => (
              <div className="legend-row" key={item.label}>
                <span className="legend-chip" style={{ background: item.color }}></span>
                <span>{item.label}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-header">
          <h3>Historique detaille</h3>
          <span className="muted">Dernieres alertes issues de la base</span>
        </div>
        <div className="table">
          {historiquePannes.map((item, index) => (
            <div key={`${item.equipement}-${item.date}-${index}`} className="table-row">
              <div>
                <strong>{item.equipement}</strong>
                <span className="muted">{item.categorie ?? '—'}</span>
              </div>
              <div>
                <span className="muted">Heure</span>
                <strong>{item.heure ?? '—'}</strong>
              </div>
              <div>
                <span className="muted">Date</span>
                <strong>{item.date ?? '—'}</strong>
              </div>
              <div>
                <span className="muted">Statut</span>
                <strong>{item.commentaires ?? '—'}</strong>
              </div>
              <div className="status">
                <span className={`status-pill ${item.commentaires === 'Panne' ? 'warning' : 'ok'}`}>
                  {item.commentaires === 'Panne' ? '1' : '0'}
                </span>
              </div>
            </div>
          ))}
          {!historiquePannes.length && (
            <div className="table-row">
              <div>
                <strong>Aucune donnee</strong>
                <span className="muted">Pas d'historique disponible</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HistoriquePage;
