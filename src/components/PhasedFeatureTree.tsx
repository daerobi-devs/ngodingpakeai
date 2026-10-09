'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PRDOutput, RoadmapPhaseNode } from '@/types/prd';
import { InteractiveTreeCanvas, TreeCanvasModule } from '@/components/tree/InteractiveTreeCanvas';
import {
  getSanitizedTreeNodes,
  generateModuleCodingTasks,
  isGarbageString,
  TreeModuleTask,
} from '@/lib/tree-task-generator';

export { getSanitizedTreeNodes, generateModuleCodingTasks, isGarbageString };
export type { TreeModuleTask };

interface PhasedFeatureTreeProps {
  prd: PRDOutput;
  theme?: 'dark' | 'light';
  mode?: 'wizard' | 'studio' | 'split' | 'standalone';
  isTasksGenerated?: boolean;
  onGenerateTasks?: () => void;
  taskCompletion?: Record<string, boolean>;
  onToggleTask?: (modId: string, taskId: string) => void;
}

export const PhasedFeatureTree: React.FC<PhasedFeatureTreeProps> = ({
  prd,
  theme = 'dark',
  mode = 'standalone',
  isTasksGenerated = true,
  onGenerateTasks,
  taskCompletion: externalTaskCompletion,
  onToggleTask: externalOnToggleTask,
}) => {
  const [showTasks, setShowTasks] = useState(true);

  const prdIdentifier = (prd as { id?: string }).id || prd.title || 'default';
  const storageKey = `ngodingpakeprd_studio_tree_tasks_${prdIdentifier}`;

  // Internal state if parent doesn't manage taskCompletion
  const [internalTaskCompletion, setInternalTaskCompletion] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {};
  });

  // Sync internal state when prd changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !externalTaskCompletion) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setInternalTaskCompletion(JSON.parse(saved));
        } else {
          setInternalTaskCompletion({});
        }
      } catch {
        // fallback
      }
    }
  }, [prdIdentifier, storageKey, externalTaskCompletion]);

  const effectiveTaskCompletion = externalTaskCompletion ?? internalTaskCompletion;

  // Handle task toggle
  const handleToggleTask = useCallback(
    (modId: string, taskId: string) => {
      if (externalOnToggleTask) {
        externalOnToggleTask(modId, taskId);
      } else {
        setInternalTaskCompletion((prev) => {
          const next = {
            ...prev,
            [taskId]: !prev[taskId],
          };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(storageKey, JSON.stringify(next));
            } catch {
              // silent
            }
          }
          return next;
        });
      }
    },
    [externalOnToggleTask, storageKey]
  );

  // Derive or use existing roadmap tree nodes
  const nodes: RoadmapPhaseNode[] = useMemo(() => {
    return getSanitizedTreeNodes(prd);
  }, [prd]);

  // Map to TreeCanvasModule
  const canvasModules: TreeCanvasModule[] = useMemo(() => {
    return nodes.map((node, nIdx) => {
      const generatedTasks = isTasksGenerated
        ? generateModuleCodingTasks(node, nIdx, effectiveTaskCompletion)
        : [];

      return {
        id: node.id || `node-${nIdx}`,
        name: node.title,
        phase: node.phase,
        complexity: 'Sedang' as const,
        description: node.description || `Spesifikasi alur dan fungsionalitas modul ${node.title}.`,
        enabled: true,
        subFeatures: (node.sub_features || []).map((sf) =>
          typeof sf === 'string' ? sf : (sf as { label?: string }).label || ''
        ),
        tasks: generatedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          completed: effectiveTaskCompletion[t.id] ?? false,
          priority: t.priority,
        })),
      };
    });
  }, [nodes, effectiveTaskCompletion, isTasksGenerated]);

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl bg-[#090b10]">
      <InteractiveTreeCanvas
        title={prd.title || 'Pohon Fitur Berfase'}
        subtitle={prd.opportunity_framing?.working_hypothesis || 'Peta jalan pengembangan terstruktur'}
        techStackLabel={prd.architecture_diagrams?.system_flowchart ? 'Living Spec' : 'Next.js 16 + Supabase'}
        modules={canvasModules}
        mode={mode}
        theme={theme}
        showTasks={showTasks}
        onToggleShowTasks={() => setShowTasks(!showTasks)}
        onToggleTask={handleToggleTask}
        onGenerateTasks={onGenerateTasks}
      />
    </div>
  );
};
