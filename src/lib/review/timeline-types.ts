import type { SceneView, Focus, GamePresentation, MotionSprite } from '../presentation/types';
export type MotionCue = Omit<MotionSprite, 'progress'> & { start: number; end: number };
export type Beat = {
  at: number;
  label: string;
  detail: string;
  focus?: Focus;
  patch?: (view: SceneView) => void;
};
export type Scenario = {
  id: string;
  group: string;
  title: string;
  description: string;
  duration: number;
  beats: Beat[];
  motions: MotionCue[];
  fixture: () => SceneView;
};
export type Frame = GamePresentation & { sceneId: string; beat: number; progress: number };
