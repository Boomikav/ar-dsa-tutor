import React from 'react';
import { DSATopic } from '../models/topic';
import { MasteryBadge } from './MasteryBadge';
import { Clock, Lock, Sparkles, Box, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { DSARegistry } from '../services/dsa/core/DSARegistry';
import { isARSupportedTopic } from '../data/topicsData';

export type TopicProgressStatus = 'LOCKED' | 'AVAILABLE' | 'IN PROGRESS' | 'NEEDS REVIEW' | 'MASTERED';

interface TopicCardProps {
  topic: DSATopic;
  masteryPercentage: number;
  isLocked?: boolean;
  needsReview?: boolean;
  missingPrereqName?: string;
  onSelect: (topic: DSATopic) => void;
  onLaunchAR?: (topic: DSATopic) => void;
  onLaunch3D?: (topic: DSATopic) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  masteryPercentage,
  isLocked = false,
  needsReview = false,
  missingPrereqName,
  onSelect,
  onLaunchAR,
  onLaunch3D
}) => {
  const getDifficultyBadge = (difficulty: string) => {
    if (difficulty === 'Beginner') return <span className="badge badge-emerald">Beginner</span>;
    if (difficulty === 'Intermediate') return <span className="badge badge-amber">Intermediate</span>;
    return <span className="badge badge-rose">Advanced</span>;
  };

  const getStatusBadge = (): { label: string; badgeClass: string; icon: React.ReactNode } => {
    if (isLocked) {
      return { label: 'Locked', badgeClass: 'badge-amber', icon: <Lock size={10} /> };
    }
    if (needsReview) {
      return { label: 'Needs Review', badgeClass: 'badge-rose', icon: <AlertTriangle size={10} /> };
    }
    if (masteryPercentage >= 80) {
      return { label: 'Mastered', badgeClass: 'badge-emerald', icon: <CheckCircle2 size={10} /> };
    }
    if (masteryPercentage > 0) {
      return { label: 'In Progress', badgeClass: 'badge-cyan', icon: <BookOpen size={10} /> };
    }
    return { label: 'Available', badgeClass: 'badge-purple', icon: null };
  };

  const status = getStatusBadge();
  const capability = DSARegistry.getVisualizationCapability(topic.id);
  const isAR = isARSupportedTopic(topic.id);

  return (
    <div
      className={`card card-interactive ${isLocked ? 'locked-card' : ''}`}
      onClick={() => onSelect(topic)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        opacity: isLocked ? 0.75 : 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              {topic.category === 'data-structure' ? 'Data Structure' : 'Algorithm'}
            </span>
            {getDifficultyBadge(topic.difficulty)}
            <span className={`badge ${status.badgeClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}>
              {status.icon}
              {status.label}
            </span>
          </div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {topic.title}
          </h2>
        </div>
        <MasteryBadge percentage={masteryPercentage} />
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {topic.shortDescription}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> {topic.estimatedMinutes}m
          </span>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px', 
            color: isAR ? 'var(--accent-cyan)' : capability === '3D_READY' ? 'var(--accent-purple)' : 'var(--warning)' 
          }}>
            <Box size={13} /> {isAR ? 'WebXR AR' : capability === '3D_READY' ? '3D Model' : '2D Canvas'}
          </span>
        </div>

        {isLocked ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--warning)' }}>
            <Lock size={12} /> {missingPrereqName ? `Needs ${missingPrereqName}` : 'Locked'}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px' }}>
            {isAR && onLaunchAR && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchAR(topic);
                }}
                className="btn btn-secondary btn-sm"
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '11px', 
                  color: 'var(--accent-cyan)' 
                }}
                title="Launch in WebXR AR"
              >
                <Sparkles size={12} /> AR
              </button>
            )}
            {!isAR && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onLaunch3D) onLaunch3D(topic);
                  else onSelect(topic);
                }}
                className="btn btn-secondary btn-sm"
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '11px', 
                  color: capability === '3D_READY' ? 'var(--accent-purple)' : 'var(--text-secondary)' 
                }}
                title={capability === '3D_READY' ? "Launch 3D Visualizer" : "Launch 2D Visualizer"}
              >
                <Box size={12} /> {capability === '3D_READY' ? '3D' : '2D'}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(topic);
              }}
              className="btn btn-primary btn-sm"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              Study
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
