import { useEffect, useMemo, useRef, useState } from 'react';
import { sendAssistantMessage } from '../services/assistantApi';

const STORAGE_KEY = 'assistant-ia-history';
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
const QUICK_PROMPTS = [
  'Resumer les pannes du mois en cours.',
  'Quels equipements semblent les plus critiques ?',
  'Donne-moi trois priorites de maintenance aujourd hui.',
  'Explique simplement les incidents les plus frequents.',
];

function createMessage(role, content, extra = {}) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

function getInitialMessages() {
  const fallback = [
    createMessage(
      'assistant',
      "Bonjour, je suis pret a vous aider sur les pannes, les tendances et les priorites de supervision.",
    ),
  ];

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawHistory = window.localStorage.getItem(STORAGE_KEY);
    if (!rawHistory) {
      return fallback;
    }

    const parsedHistory = JSON.parse(rawHistory);
    return Array.isArray(parsedHistory) && parsedHistory.length ? parsedHistory : fallback;
  } catch {
    return fallback;
  }
}

function formatTimestamp(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderAssistantContent(content) {
  const lines = String(content || '')
    .split('\n')
    .map((line) => line.trimEnd());
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];
  let listType = null;

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push({
      type: 'paragraph',
      lines: [...paragraphLines],
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length || !listType) {
      return;
    }

    blocks.push({
      type: listType,
      items: [...listItems],
    });
    listItems = [];
    listType = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const orderedMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== 'ordered') {
        flushList();
        listType = 'ordered';
      }
      listItems.push(orderedMatch[2].trim());
      return;
    }

    const unorderedMatch = trimmed.match(/^[-•]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType !== 'unordered') {
        flushList();
        listType = 'unordered';
      }
      listItems.push(unorderedMatch[1].trim());
      return;
    }

    if (listType) {
      flushList();
    }

    paragraphLines.push(trimmed);
  });

  flushParagraph();
  flushList();

  return blocks.map((block, index) => {
    if (block.type === 'ordered') {
      return (
        <ol key={`block-${index}`} className="assistant-message-list ordered">
          {block.items.map((item, itemIndex) => (
            <li key={`ordered-${index}-${itemIndex}`}>{item}</li>
          ))}
        </ol>
      );
    }

    if (block.type === 'unordered') {
      return (
        <ul key={`block-${index}`} className="assistant-message-list unordered">
          {block.items.map((item, itemIndex) => (
            <li key={`unordered-${index}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`block-${index}`} className="assistant-message-text">
        {block.lines.join('\n')}
      </p>
    );
  });
}

function AssistantPage() {
  const [messages, setMessages] = useState(getInitialMessages);
  const [message, setMessage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatWindowRef = useRef(null);
  const selectedPeriod =
    selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}` : undefined;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages, isLoading]);

  const quickActions = useMemo(
    () =>
      QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          className="assistant-chip"
          type="button"
          onClick={() => setMessage(prompt)}
          disabled={isLoading}
        >
          {prompt}
        </button>
      )),
    [isLoading],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    const userMessage = createMessage('user', trimmedMessage);
    setMessages((current) => [...current, userMessage]);
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await sendAssistantMessage(trimmedMessage, {
        period: selectedPeriod,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      });
      setMessages((current) => [
        ...current,
        createMessage('assistant', response.reply, {
          model: response.model,
          provider: response.provider,
          context: response.context,
          createdAt: response.createdAt,
        }),
      ]);
    } catch (requestError) {
      const isTimeout =
        requestError?.code === 'ECONNABORTED' ||
        String(requestError?.message || '').toLowerCase().includes('timeout');
      const nextError = isTimeout
        ? "L'assistant met trop de temps a repondre. OpenRouter est peut-etre lent pour le moment, reessayez dans quelques secondes."
        : requestError?.response?.data?.message ||
          requestError?.message ||
          "Une erreur s'est produite pendant la reponse de l'assistant.";

      setError(nextError);
      setMessages((current) => [
        ...current,
        createMessage(
          'assistant',
          isTimeout
            ? "Je prends plus de temps que prevu pour repondre. Reessayez dans quelques secondes."
            : "Je n'ai pas pu repondre pour le moment. Verifiez la configuration OpenRouter et reessayez.",
        ),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const initialMessages = [
      createMessage(
        'assistant',
        "Bonjour, je suis pret a vous aider sur les pannes, les tendances et les priorites de supervision.",
      ),
    ];
    setMessages(initialMessages);
    setError('');
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMessages));
    }
  };

  const handleResetContext = () => {
    setSelectedMonth('');
    setSelectedYear('');
    setSelectedCategory('ALL');
  };

  return (
    <section className="section page-assistant">
      <header className="topbar">
        <div>
          <p className="eyebrow">Assistant IA</p>
          <h1>Assistant intelligent</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={handleReset} disabled={isLoading}>
            Effacer l'historique
          </button>
        </div>
      </header>

      <div className="section-header">
        <div>
          <h2>Conversation en direct</h2>
          <p className="muted">
            Assistant branche a OpenRouter avec historique local et suivi des erreurs.
          </p>
        </div>
        <div className="assistant-header-actions">
          <div className="period-filter assistant-filter-bar">
            <div className="period-filter-group">
              <label className="muted" htmlFor="assistant-mois-select">
                Mois
              </label>
              <select
                id="assistant-mois-select"
                className="period-select"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                disabled={isLoading}
              >
                <option value="">Auto</option>
                {MONTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="period-filter-group">
              <label className="muted" htmlFor="assistant-annee-select">
                Annee
              </label>
              <select
                id="assistant-annee-select"
                className="period-select"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                disabled={isLoading}
              >
                <option value="">Auto</option>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="period-filter-group">
              <label className="muted" htmlFor="assistant-categorie-select">
                Categorie
              </label>
              <select
                id="assistant-categorie-select"
                className="period-select"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                disabled={isLoading}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="ghost-button" type="button" onClick={handleResetContext} disabled={isLoading}>
            Reinitialiser le contexte
          </button>
          <div className="pill">{isLoading ? 'Generation en cours' : 'Pret a repondre'}</div>
        </div>
      </div>

      <div className="assistant-layout">
        <div className="card chat-card assistant-chat-card">
          <div className="assistant-chip-list">{quickActions}</div>

          <div ref={chatWindowRef} className="chat-window assistant-chat-window">
            {messages.map((entry) => (
              <article
                key={entry.id}
                className={`chat-bubble ${entry.role === 'assistant' ? 'ai' : 'user'}`}
              >
                <div className="assistant-message-meta">
                  <strong>{entry.role === 'assistant' ? 'Assistant IA' : 'Vous'}</strong>
                  <span>{formatTimestamp(entry.createdAt)}</span>
                </div>
                {entry.role === 'assistant' ? (
                  <div className="assistant-message-body">{renderAssistantContent(entry.content)}</div>
                ) : (
                  <p className="assistant-message-text">{entry.content}</p>
                )}
                {entry.role === 'assistant' && (entry.model || entry.provider) ? (
                  <>
                    <small className="assistant-message-foot">
                      {entry.provider ? `${entry.provider}` : ''}
                      {entry.provider && entry.model ? ' · ' : ''}
                      {entry.model || ''}
                    </small>
                    {entry.context?.period || entry.context?.category ? (
                      <div className="assistant-context-pill">
                        <span>
                          Periode comprise : <strong>{entry.context?.period || 'auto'}</strong>
                        </span>
                        <span>
                          Categorie comprise : <strong>{entry.context?.category || 'toutes'}</strong>
                        </span>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </article>
            ))}

            {isLoading ? (
              <div className="chat-bubble ai assistant-loading">
                <div className="assistant-message-meta">
                  <strong>Assistant IA</strong>
                  <span>En cours</span>
                </div>
                <div className="assistant-dots" aria-label="Chargement">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}
          </div>

          {error ? <div className="assistant-error-banner">{error}</div> : null}

          <form className="chat-input assistant-chat-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Posez une question a l'assistant..."
              disabled={isLoading}
            />
            <button className="primary-button" type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
          <p className="muted">
            Contexte actif :{' '}
            <strong>{selectedPeriod || 'periode automatique'}</strong>
            {' · '}
            <strong>{selectedCategory === 'ALL' ? 'toutes les categories' : selectedCategory}</strong>
          </p>
        </div>

        <aside className="card assistant-side-card">
          <div className="card-header">
            <div>
              <h3>Bonnes pratiques</h3>
              <p className="muted">Pour obtenir des reponses plus utiles</p>
            </div>
          </div>

          <div className="assistant-tips">
            <div className="assistant-tip">
              <strong>Soyez precis</strong>
              <p>Mentionnez la periode, la categorie ou l'equipement concerne.</p>
            </div>
            <div className="assistant-tip">
              <strong>Demandez une action claire</strong>
              <p>Exemple : resumer, comparer, prioriser, expliquer ou proposer.</p>
            </div>
            <div className="assistant-tip">
              <strong>Gardez le contexte</strong>
              <p>L'historique local conserve vos derniers echanges dans le navigateur.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AssistantPage;
