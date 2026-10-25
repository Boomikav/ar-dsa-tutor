import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { TopicCard } from '../components/TopicCard';
import { TopicCategory } from '../models/topic';
import { Search, Layers, Compass, Sparkles } from 'lucide-react';
import { isARSupportedTopic } from '../data/topicsData';

export const TopicExplorerScreen: React.FC = () => {
  const { topics, learnerState, navigateTo, services } = useApp();
  const [activeCategory, setActiveCategory] = useState<TopicCategory>('data-structure');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [arOnlyFilter, setArOnlyFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'order' | 'mastery' | 'difficulty'>('order');
  const [prereqMap, setPrereqMap] = useState<Record<string, { satisfied: boolean; missingName?: string }>>({});

  // Compute prerequisite readiness for topics
  useEffect(() => {
    const checkAll = async () => {
      const map: Record<string, { satisfied: boolean; missingName?: string }> = {};
      for (const topic of topics) {
        const result = await services.knowledgeGraphService.checkPrerequisitesSatisfied(topic.id, learnerState);
        let missingName: string | undefined;
        if (!result.satisfied && result.missingPrerequisiteTopicIds.length > 0) {
          const missingTopic = topics.find(t => t.id === result.missingPrerequisiteTopicIds[0]);
          missingName = missingTopic?.title;
        }
        map[topic.id] = {
          satisfied: result.satisfied,
          missingName
        };
      }
      setPrereqMap(map);
    };

    checkAll();
  }, [topics, learnerState, services]);

  const difficultyRank: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };

  const filteredTopics = topics.filter(topic => {
    const isAR = isARSupportedTopic(topic.id);
    if (arOnlyFilter && !isAR) return false;
    const matchesCategory = arOnlyFilter ? true : (topic.category === activeCategory);
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'all' || topic.difficulty === difficultyFilter;
    return matchesCategory && matchesSearch && matchesDifficulty;
  }).sort((a, b) => {
    if (sortBy === 'mastery') {
      const mA = learnerState.masteryMap[a.id]?.masteryPercentage || 0;
      const mB = learnerState.masteryMap[b.id]?.masteryPercentage || 0;
      return mB - mA;
    }
    if (sortBy === 'difficulty') {
      return (difficultyRank[a.difficulty] || 0) - (difficultyRank[b.difficulty] || 0);
    }
    return 0; // Natural curriculum DAG order
  });

  const dsCount = topics.filter(t => t.category === 'data-structure').length;
  const algoCount = topics.filter(t => t.category === 'algorithm').length;

  return (
    <div className="mobile-screen-content">
      <HeaderBar title="DSA Curriculum" />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          <input
            type="text"
            placeholder="Search concepts, arrays, trees, search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '42px' }}
          />
        </div>

        {/* Category Tabs: Data Structures vs Algorithms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          <button
            onClick={() => setActiveCategory('data-structure')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: activeCategory === 'data-structure' ? 'var(--bg-card)' : 'transparent',
              color: activeCategory === 'data-structure' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
              border: activeCategory === 'data-structure' ? '1px solid var(--border-accent)' : '1px solid transparent',
              transition: 'all 200ms ease'
            }}
          >
            <Layers size={15} />
            <span>Data Structures ({dsCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('algorithm')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: activeCategory === 'algorithm' ? 'var(--bg-card)' : 'transparent',
              color: activeCategory === 'algorithm' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
              border: activeCategory === 'algorithm' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
              transition: 'all 200ms ease'
            }}
          >
            <Compass size={15} />
            <span>Algorithms ({algoCount})</span>
          </button>
        </div>

        {/* Filters and Sorting Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', alignItems: 'center' }}>
            <button
              onClick={() => setArOnlyFilter(prev => !prev)}
              className={`btn btn-sm ${arOnlyFilter ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                borderColor: arOnlyFilter ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                color: arOnlyFilter ? '#000' : 'var(--accent-cyan)',
                background: arOnlyFilter ? 'var(--accent-cyan)' : 'transparent',
                fontWeight: 700
              }}
            >
              <Sparkles size={11} /> AR Ready (5)
            </button>
            {['all', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`btn btn-sm ${difficultyFilter === diff && !arOnlyFilter ? 'btn-secondary' : 'btn-ghost'}`}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderColor: difficultyFilter === diff && !arOnlyFilter ? 'var(--border-accent)' : 'transparent',
                  color: difficultyFilter === diff && !arOnlyFilter ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'order' | 'mastery' | 'difficulty')}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <option value="order">Curriculum Order</option>
              <option value="mastery">Highest Mastery</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>
        </div>

        {/* Topics List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredTopics.map(topic => {
            const mastery = learnerState.masteryMap[topic.id]?.masteryPercentage || 0;
            const needsReview = learnerState.masteryMap[topic.id]?.needsReview || false;
            const prereqStatus = prereqMap[topic.id];
            const isLocked = prereqStatus ? !prereqStatus.satisfied : false;

            return (
              <TopicCard
                key={topic.id}
                topic={topic}
                masteryPercentage={mastery}
                isLocked={isLocked}
                needsReview={needsReview}
                missingPrereqName={prereqStatus?.missingName}
                onSelect={(t) => navigateTo('topic-details', t)}
                onLaunchAR={(t) => navigateTo('ar-session', t)}
                onLaunch3D={(t) => navigateTo('learning-session', t)}
              />
            );
          })}

          {filteredTopics.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
              No topics matched your search filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
