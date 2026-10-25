import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { TutorResponse, PedagogicalStyle } from '../models/ai';
import { LearnerContextBuilder } from '../services/ai/LearnerContextBuilder';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Info, 
  Lightbulb, 
  HelpCircle, 
  Brain, 
  CheckCircle2, 
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ChatEntry {
  id: string;
  sender: 'user' | 'ai-tutor';
  timestamp: string;
  userText?: string;
  aiResponse?: TutorResponse;
}

export const AITutorScreen: React.FC = () => {
  const { selectedTopic, learnerState, services, activeTutorContext } = useApp();
  const [pedagogicalStyle, setPedagogicalStyle] = useState<PedagogicalStyle>('socratic');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedReasoningMap, setExpandedReasoningMap] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat history
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'msg-initial',
      sender: 'ai-tutor',
      timestamp: new Date().toISOString(),
      aiResponse: {
        responseType: 'EXPLANATION',
        message: `Hello ${learnerState.profile.fullName.split(' ')[0]}! I am your AI Socratic Tutor for **${selectedTopic.title}**.\n\nI have access to your active topic context and learning invariants. How can I assist your understanding today?`,
        reasoning: 'Initial greeting personalized to the learner profile and topic invariant.',
        concept: selectedTopic.shortDescription || 'BST_INVARIANT',
        difficulty: 'INTERMEDIATE',
        suggestedPrompts: [
          'Explain the core invariant',
          'Give me a hint on insertion',
          'Why does In-Order traversal sort keys?'
        ],
        isFallback: false,
        provider: 'TutorAgent',
        model: 'gemini-3.8-flash',
        timestamp: new Date().toISOString()
      }
    }
  ]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle auto-invocation when navigated from Practice Mode or Guided Mode
  useEffect(() => {
    if (activeTutorContext && activeTutorContext.topic.id === selectedTopic.id) {
      const runContextualTutor = async () => {
        setIsProcessing(true);
        const req = LearnerContextBuilder.buildRequest({
          topic: activeTutorContext.topic,
          learnerState,
          helpLevel: activeTutorContext.helpLevel || (activeTutorContext.misconception ? 'mistake_remediation' : 'hint'),
          currentOperation: activeTutorContext.operation,
          misconception: activeTutorContext.misconception,
          userQuery: activeTutorContext.initialQuery,
          overrideStyle: pedagogicalStyle
        });

        // Add contextual user prompt message
        const promptLabel = activeTutorContext.misconception
          ? `Diagnose mistake: chose ${activeTutorContext.misconception.userChoice} at node ${activeTutorContext.operation?.currentNodeValue} for target ${activeTutorContext.operation?.targetValue}`
          : `Request hint for current step (${activeTutorContext.operation?.comparisonText || 'operation'})`;

        const userEntry: ChatEntry = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          timestamp: new Date().toISOString(),
          userText: promptLabel
        };

        setMessages(prev => [...prev, userEntry]);

        try {
          const response = await services.aiService.consultTutor(req);
          const aiEntry: ChatEntry = {
            id: `ai-${Date.now()}`,
            sender: 'ai-tutor',
            timestamp: new Date().toISOString(),
            aiResponse: response
          };
          setMessages(prev => [...prev, aiEntry]);
        } catch (err) {
          console.error('[AITutorScreen] Error calling consultTutor:', err);
        } finally {
          setIsProcessing(false);
        }
      };

      runContextualTutor();
    }
  }, [activeTutorContext, selectedTopic.id]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isProcessing) return;

    const userMsgId = `usr-${Date.now()}`;
    const userEntry: ChatEntry = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toISOString(),
      userText: query
    };

    setMessages(prev => [...prev, userEntry]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Build request with full learner context
      const req = LearnerContextBuilder.buildRequest({
        topic: selectedTopic,
        learnerState,
        helpLevel: query.toLowerCase().includes('hint') 
          ? 'hint' 
          : query.toLowerCase().includes('wrong') || query.toLowerCase().includes('mistake')
          ? 'mistake_remediation'
          : 'general_question',
        currentOperation: activeTutorContext?.operation || {
          operationType: 'insert',
          targetValue: 40,
          currentNodeValue: 50,
          comparisonText: '40 < 50',
          deterministicDecision: 'MOVE_LEFT'
        },
        misconception: activeTutorContext?.misconception,
        userQuery: query,
        overrideStyle: pedagogicalStyle
      });

      const response = await services.aiService.consultTutor(req);

      const aiEntry: ChatEntry = {
        id: `ai-${Date.now()}`,
        sender: 'ai-tutor',
        timestamp: new Date().toISOString(),
        aiResponse: response
      };

      setMessages(prev => [...prev, aiEntry]);
    } catch (err) {
      console.error('[AITutorScreen] Communication exception:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleReasoning = (id: string) => {
    setExpandedReasoningMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getBadgeForType = (type?: string) => {
    switch (type) {
      case 'MISTAKE_EXPLANATION':
        return <span className="badge badge-rose"><AlertTriangle size={11} style={{ marginRight: '3px' }} /> Misconception Remediation</span>;
      case 'HINT':
        return <span className="badge badge-amber"><Lightbulb size={11} style={{ marginRight: '3px' }} /> Instructional Hint</span>;
      case 'CONCEPT_CHECK':
        return <span className="badge badge-purple"><HelpCircle size={11} style={{ marginRight: '3px' }} /> Concept Check</span>;
      default:
        return <span className="badge badge-cyan"><Brain size={11} style={{ marginRight: '3px' }} /> Explanation</span>;
    }
  };

  return (
    <div className="mobile-screen-content" style={{ display: 'flex', flexDirection: 'column' }}>
      <HeaderBar
        title="Generative AI Tutor"
        showBack
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '9px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <ShieldCheck size={11} /> Secure Backend
            </span>
          </div>
        }
      />

      {/* Prominent Educational Disclaimer Bar */}
      <div
        style={{
          padding: '5px var(--space-4)',
          background: 'rgba(14, 165, 233, 0.08)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10.5px',
          color: 'var(--text-tertiary)'
        }}
      >
        <Info size={12} color="var(--accent-cyan)" />
        <span>Generated pedagogical guidance; deterministic engines remain the algorithmic ground truth.</span>
      </div>

      {/* TOP LEARNER CONTEXT & 6 TUTOR MODES */}
      <div
        style={{
          padding: '10px var(--space-4)',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedTopic.title}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              • {learnerState.masteryMap[selectedTopic.id]?.masteryPercentage ?? 0}% Mastery
            </span>
          </div>

          {/* Quick 6 Modes Selector */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '2px' }}>
            {[
              { label: 'Explain', query: 'Can you explain the core concepts and invariants of this step?' },
              { label: 'Hint', query: 'Can you give me a subtle hint on what to compare next?' },
              { label: 'Socratic', style: 'socratic' as PedagogicalStyle, query: 'Guide my reasoning with a Socratic question.' },
              { label: 'Analogy', style: 'analogical' as PedagogicalStyle, query: 'Can you explain this with a real-world physical analogy?' },
              { label: 'Explain Mistake', query: 'Why was my previous decision incorrect and how does it violate the invariant?' },
              { label: 'Check Understanding', query: 'Give me a quick invariant check question to test my understanding.' }
            ].map((mode, i) => (
              <button
                key={i}
                onClick={() => {
                  if (mode.style) setPedagogicalStyle(mode.style);
                  handleSendMessage(mode.query);
                }}
                disabled={isProcessing}
                className="btn btn-ghost btn-sm"
                style={{
                  padding: '3px 8px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-card)'
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Operation / Misconception Banner if available */}
        {activeTutorContext?.misconception && (
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--danger-dim)',
              border: '1px solid var(--danger)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--text-primary)'
            }}
          >
            <span>
              Active Misconception: <strong style={{ color: 'var(--danger)' }}>{activeTutorContext.misconception.type}</strong>
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
              Target: {activeTutorContext.operation?.targetValue} | Node: {activeTutorContext.operation?.currentNodeValue}
            </span>
          </div>
        )}
      </div>

      {/* CHAT / TUTOR MESSAGES CONTAINER */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}
      >
        {messages.map(msg => {
          const isAI = msg.sender === 'ai-tutor';
          const resp = msg.aiResponse;
          const isReasoningExpanded = resp ? expandedReasoningMap[msg.id] ?? false : false;

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAI ? 'flex-start' : 'flex-end',
                gap: '4px',
                maxWidth: '94%',
                alignSelf: isAI ? 'flex-start' : 'flex-end'
              }}
            >
              {/* Message Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                {isAI ? <Bot size={12} color="var(--accent-purple)" /> : <User size={12} />}
                <span>{isAI ? 'Tutor Agent' : 'You'}</span>
                {resp && (
                  <span style={{ fontSize: '9.5px', color: resp.isFallback ? 'var(--warning)' : 'var(--accent-cyan)' }}>
                    [{resp.provider} • {resp.model}]
                  </span>
                )}
              </div>

              {/* Message Card */}
              {isAI && resp ? (
                <div
                  className="card"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: 'var(--bg-tertiary)',
                    border: resp.isFallback ? '1px dashed var(--warning)' : '1px solid var(--border-card)',
                    width: '100%'
                  }}
                >
                  {/* Category Badge & Concept Tag */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    {getBadgeForType(resp.responseType)}
                    <span style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {resp.concept}
                    </span>
                  </div>

                  {/* Main Instructional Message */}
                  <div style={{ fontSize: '13px', lineHeight: 1.55, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                    {resp.message}
                  </div>

                  {/* Recommended Next Action Chip */}
                  {resp.nextAction && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(0, 242, 254, 0.1)',
                        border: '1px solid rgba(0, 242, 254, 0.3)',
                        fontSize: '11px',
                        color: 'var(--accent-cyan)',
                        alignSelf: 'flex-start',
                        marginTop: '2px'
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Recommended Action: <strong>{resp.nextAction}</strong></span>
                    </div>
                  )}

                  {/* Pedagogical Reasoning Accordion */}
                  {resp.reasoning && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '2px' }}>
                      <button
                        onClick={() => toggleReasoning(msg.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-purple)',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <span>Pedagogical Reasoning</span>
                        {isReasoningExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isReasoningExpanded && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {resp.reasoning}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Fallback Notice */}
                  {resp.isFallback && (
                    <div style={{ fontSize: '10px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Info size={11} />
                      <span>Delivered via verified offline pedagogical rule engine.</span>
                    </div>
                  )}
                </div>
              ) : (
                /* User Message Bubble */
                <div
                  style={{
                    padding: '9px 13px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)',
                    color: 'var(--text-on-accent)',
                    fontSize: '13px',
                    lineHeight: 1.5
                  }}
                >
                  {msg.userText}
                </div>
              )}

              {/* Suggested Questions Chips (for latest AI response) */}
              {isAI && resp && resp.suggestedPrompts && resp.suggestedPrompts.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                  {resp.suggestedPrompts.map((promptText, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(promptText)}
                      className="badge badge-purple"
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: '10.5px',
                        border: '1px solid rgba(139, 92, 246, 0.4)'
                      }}
                    >
                      {promptText} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', fontSize: '12px', padding: '6px 0' }}>
            <Sparkles size={14} className="spin" />
            <span>Consulting secure Generative AI model with learner context...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK PROMPT PILLS BAR */}
      <div
        style={{
          padding: '6px var(--space-4)',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
      >
        {[
          'Explain this step',
          'Give me a hint',
          'Why was my answer wrong?',
          'Show me an example',
          'Explain more simply'
        ].map((promptLabel, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(promptLabel)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--accent-cyan)' }}
            disabled={isProcessing}
          >
            {promptLabel}
          </button>
        ))}
      </div>

      {/* BOTTOM INPUT BAR */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <input
          type="text"
          placeholder={`Ask about ${selectedTopic.title} (${pedagogicalStyle} mode)...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          disabled={isProcessing}
          style={{ flex: 1, height: '40px', fontSize: '13px' }}
        />
        <button
          onClick={() => handleSendMessage()}
          className="btn btn-primary btn-icon-only"
          disabled={isProcessing || !inputText.trim()}
          style={{ width: '40px', height: '40px' }}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
