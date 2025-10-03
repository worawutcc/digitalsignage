/**
 * Enhanced Animation System
 * 
 * Provides animation system using framer-motion with smooth transitions,
 * reduced motion accessibility support, and performance-optimized animations.
 * 
 * @fileoverview Enhanced animation system for user schedule assignment features
 * @version 1.0.0
 */

import { Variants, Transition, MotionProps } from 'framer-motion';

// Types
export interface AnimationConfig {
  /** Enable reduced motion support */
  respectReducedMotion?: boolean;
  /** Default animation duration in seconds */
  defaultDuration?: number;
  /** Default easing function */
  defaultEasing?: string | number[];
  /** Enable GPU acceleration for animations */
  enableGPUAcceleration?: boolean;
  /** Performance monitoring for animations */
  enablePerformanceMonitoring?: boolean;
}

export interface AnimationPreset {
  /** Preset name */
  name: string;
  /** Animation variants */
  variants: Variants;
  /** Default transition settings */
  transition: Transition;
  /** Performance optimization settings */
  performance?: PerformanceConfig;
}

export interface PerformanceConfig {
  /** Use transform instead of layout properties */
  useTransform?: boolean;
  /** Enable will-change CSS property */
  enableWillChange?: boolean;
  /** Limit concurrent animations */
  maxConcurrentAnimations?: number;
  /** Debounce rapid animations */
  debounceMs?: number;
}

export interface AnimationTrigger {
  /** Trigger type */
  type: 'hover' | 'focus' | 'visible' | 'click' | 'load' | 'scroll';
  /** Animation to play */
  animation: string;
  /** Delay before animation starts */
  delay?: number;
  /** Animation options */
  options?: AnimationOptions;
}

export interface AnimationOptions {
  /** Animation duration override */
  duration?: number;
  /** Easing override */
  easing?: string | number[];
  /** Repeat count (-1 for infinite) */
  repeat?: number;
  /** Reverse animation on completion */
  reverse?: boolean;
  /** Start delay */
  delay?: number;
}

export interface AnimationMetrics {
  /** Animation name */
  name: string;
  /** Start time */
  startTime: number;
  /** End time */
  endTime?: number;
  /** Duration in milliseconds */
  duration: number;
  /** Performance impact score (1-10) */
  performanceScore?: number;
  /** Frame rate during animation */
  averageFPS?: number;
}

// Default configuration
const DEFAULT_CONFIG: Required<AnimationConfig> = {
  respectReducedMotion: true,
  defaultDuration: 0.3,
  defaultEasing: [0.4, 0.0, 0.2, 1], // Material Design easing
  enableGPUAcceleration: true,
  enablePerformanceMonitoring: false,
};

// Animation presets for enhanced UI components
const ENHANCED_PRESETS: AnimationPreset[] = [
  {
    name: 'fadeIn',
    variants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1],
    },
    performance: {
      useTransform: false,
      enableWillChange: true,
    },
  },
  {
    name: 'slideUp',
    variants: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    transition: {
      duration: 0.4,
      ease: [0.4, 0.0, 0.2, 1],
    },
    performance: {
      useTransform: true,
      enableWillChange: true,
    },
  },
  {
    name: 'slideDown',
    variants: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 },
    },
    transition: {
      duration: 0.4,
      ease: [0.4, 0.0, 0.2, 1],
    },
    performance: {
      useTransform: true,
      enableWillChange: true,
    },
  },
  {
    name: 'scaleIn',
    variants: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1],
    },
    performance: {
      useTransform: true,
      enableWillChange: true,
    },
  },
  {
    name: 'bounce',
    variants: {
      hidden: { opacity: 0, scale: 0.3 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        },
      },
    },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
    performance: {
      useTransform: true,
      enableWillChange: true,
    },
  },
  {
    name: 'staggerChildren',
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.1,
        },
      },
    },
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
    performance: {
      useTransform: false,
      enableWillChange: true,
    },
  },
  {
    name: 'pulse',
    variants: {
      idle: { scale: 1 },
      active: {
        scale: 1.05,
        transition: {
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 1,
        },
      },
    },
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1,
    },
    performance: {
      useTransform: true,
      enableWillChange: true,
    },
  },
  {
    name: 'loading',
    variants: {
      start: { rotate: 0 },
      end: {
        rotate: 360,
        transition: {
          repeat: Infinity,
          duration: 1,
          ease: 'linear',
        },
      },
    },
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: 'linear',
    },
    performance: {
      useTransform: true,
      enableWillChange: true,
    },
  },
  {
    name: 'progressBar',
    variants: {
      empty: { scaleX: 0 },
      filled: (progress: number) => ({
        scaleX: progress / 100,
        transition: {
          duration: 0.5,
          ease: 'easeOut',
        },
      }),
    },
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
    performance: {
      useTransform: true,
      enableWillChange: true,
    },
  },
  {
    name: 'buttonPress',
    variants: {
      idle: { scale: 1 },
      pressed: { scale: 0.95 },
      hover: { scale: 1.02 },
    },
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
    performance: {
      useTransform: true,
      enableWillChange: true,
    },
  },
];

// Complex animation sequences for user schedule assignment features
const ENHANCED_SEQUENCES = {
  bulkOperationProgress: {
    variants: {
      idle: { opacity: 0, scale: 0.8 },
      processing: { opacity: 1, scale: 1 },
      success: { opacity: 1, scale: 1.1, backgroundColor: '#10B981' },
      error: { opacity: 1, scale: 1.05, backgroundColor: '#EF4444' },
    } as Variants,
  },
  
  userListUpdate: {
    variants: {
      idle: { opacity: 1 },
      updating: { opacity: 0.6 },
      updated: { opacity: 1, backgroundColor: '#F0FDF4' },
    } as Variants,
  },

  scheduleAssignment: {
    variants: {
      idle: { x: 0, opacity: 1 },
      dragging: { x: 10, opacity: 0.8, scale: 1.05 },
      dropped: { x: 0, opacity: 1, scale: 1, backgroundColor: '#DBEAFE' },
    } as Variants,
  },
};

/**
 * Enhanced Animation Manager
 * 
 * Manages animations with performance optimization and accessibility support
 */
export class EnhancedAnimationManager {
  private config: Required<AnimationConfig>;
  private presets: Map<string, AnimationPreset> = new Map();
  private activeAnimations: Map<string, AnimationMetrics> = new Map();
  private animationQueue: Array<() => void> = [];
  private isReducedMotion: boolean = false;

  constructor(config: Partial<AnimationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializePresets();
    this.setupReducedMotionDetection();
    this.setupPerformanceMonitoring();
  }

  /**
   * Get animation preset by name
   */
  getPreset(name: string): AnimationPreset | undefined {
    return this.presets.get(name);
  }

  /**
   * Register custom animation preset
   */
  registerPreset(preset: AnimationPreset): void {
    this.presets.set(preset.name, preset);
  }

  /**
   * Get animation variants with reduced motion support
   */
  getVariants(presetName: string): Variants {
    const preset = this.presets.get(presetName);
    if (!preset) {
      console.warn(`Animation preset "${presetName}" not found`);
      return {};
    }

    if (this.isReducedMotion && this.config.respectReducedMotion) {
      return this.createReducedMotionVariants(preset.variants);
    }

    return preset.variants;
  }

  /**
   * Get animation transition with performance optimizations
   */
  getTransition(
    presetName: string,
    options: Partial<AnimationOptions> = {}
  ): Transition {
    const preset = this.presets.get(presetName);
    if (!preset) {
      return { duration: this.config.defaultDuration };
    }

    let transition = { ...preset.transition };

    // Apply options
    if (options.duration !== undefined) {
      transition.duration = options.duration;
    }
    if (options.easing) {
      transition.ease = options.easing as any;
    }
    if (options.delay !== undefined) {
      transition.delay = options.delay;
    }
    if (options.repeat !== undefined) {
      transition.repeat = options.repeat;
    }

    // Apply reduced motion adjustments
    if (this.isReducedMotion && this.config.respectReducedMotion) {
      transition = this.adjustTransitionForReducedMotion(transition);
    }

    return transition;
  }

  /**
   * Create optimized animation props for components
   */
  createAnimationProps(
    presetName: string,
    options: Partial<AnimationOptions> = {}
  ): Partial<MotionProps> {
    const preset = this.presets.get(presetName);
    if (!preset) {
      return {};
    }

    const props: Partial<MotionProps> = {
      variants: this.getVariants(presetName),
      transition: this.getTransition(presetName, options),
      initial: 'hidden',
      animate: 'visible',
    };

    // Add performance optimizations
    if (preset.performance?.enableWillChange && this.config.enableGPUAcceleration) {
      props.style = {
        willChange: 'transform, opacity',
      };
    }

    return props;
  }

  /**
   * Start performance monitoring for an animation
   */
  startAnimationMetrics(name: string): void {
    if (!this.config.enablePerformanceMonitoring) return;

    const metrics: AnimationMetrics = {
      name,
      startTime: performance.now(),
      duration: 0,
    };

    this.activeAnimations.set(name, metrics);
  }

  /**
   * End performance monitoring for an animation
   */
  endAnimationMetrics(name: string): AnimationMetrics | undefined {
    if (!this.config.enablePerformanceMonitoring) return;

    const metrics = this.activeAnimations.get(name);
    if (!metrics) return;

    metrics.endTime = performance.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    
    // Calculate performance score (simplified)
    metrics.performanceScore = this.calculatePerformanceScore(metrics);

    this.activeAnimations.delete(name);
    return metrics;
  }

  /**
   * Get all animation metrics
   */
  getMetrics(): AnimationMetrics[] {
    return Array.from(this.activeAnimations.values());
  }

  /**
   * Queue animation to prevent too many concurrent animations
   */
  queueAnimation(animationFn: () => void): void {
    const maxConcurrent = 10; // Default limit
    
    if (this.activeAnimations.size < maxConcurrent) {
      animationFn();
    } else {
      this.animationQueue.push(animationFn);
    }
  }

  /**
   * Process animation queue
   */
  private processAnimationQueue(): void {
    if (this.animationQueue.length > 0 && this.activeAnimations.size < 10) {
      const nextAnimation = this.animationQueue.shift();
      if (nextAnimation) {
        nextAnimation();
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.respectReducedMotion !== undefined) {
      this.setupReducedMotionDetection();
    }
  }

  // Private methods

  private initializePresets(): void {
    ENHANCED_PRESETS.forEach(preset => {
      this.presets.set(preset.name, preset);
    });

    // Add enhanced sequences
    Object.entries(ENHANCED_SEQUENCES).forEach(([name, sequence]) => {
      this.presets.set(name, {
        name,
        variants: sequence.variants,
        transition: { duration: 0.3 },
      });
    });
  }

  private setupReducedMotionDetection(): void {
    if (typeof window !== 'undefined' && this.config.respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.isReducedMotion = mediaQuery.matches;

      mediaQuery.addListener((e) => {
        this.isReducedMotion = e.matches;
      });
    }
  }

  private setupPerformanceMonitoring(): void {
    if (this.config.enablePerformanceMonitoring) {
      // Process animation queue periodically
      setInterval(() => {
        this.processAnimationQueue();
      }, 100);
    }
  }

  private createReducedMotionVariants(variants: Variants): Variants {
    const reducedVariants: Variants = {};
    
    Object.entries(variants).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Remove animations that might cause motion sensitivity
        const { scale, rotate, x, y, ...reduced } = value as any;
        reducedVariants[key] = reduced;
      } else {
        reducedVariants[key] = value;
      }
    });

    return reducedVariants;
  }

  private adjustTransitionForReducedMotion(transition: Transition): Transition {
    return {
      ...transition,
      duration: typeof transition.duration === 'number' 
        ? Math.min(transition.duration, 0.1) 
        : 0.1,
      ease: 'linear',
    };
  }

  private calculatePerformanceScore(metrics: AnimationMetrics): number {
    // Simplified performance scoring (1-10, higher is better)
    const targetDuration = 200; // 200ms target
    const duration = metrics.duration;
    
    if (duration <= targetDuration) {
      return 10;
    } else if (duration <= targetDuration * 2) {
      return 8;
    } else if (duration <= targetDuration * 3) {
      return 6;
    } else if (duration <= targetDuration * 4) {
      return 4;
    } else {
      return 2;
    }
  }
}

// Global animation manager instance
let globalAnimationManager: EnhancedAnimationManager | null = null;

/**
 * Initialize global animation manager
 */
export function initializeAnimationManager(
  config: Partial<AnimationConfig> = {}
): EnhancedAnimationManager {
  globalAnimationManager = new EnhancedAnimationManager(config);
  return globalAnimationManager;
}

/**
 * Get global animation manager instance
 */
export function getAnimationManager(): EnhancedAnimationManager {
  if (!globalAnimationManager) {
    globalAnimationManager = new EnhancedAnimationManager();
  }
  return globalAnimationManager;
}

// React hooks for using animations

/**
 * Hook for using enhanced animations
 */
export function useEnhancedAnimation() {
  const manager = getAnimationManager();

  return {
    getVariants: manager.getVariants.bind(manager),
    getTransition: manager.getTransition.bind(manager),
    createAnimationProps: manager.createAnimationProps.bind(manager),
    startMetrics: manager.startAnimationMetrics.bind(manager),
    endMetrics: manager.endAnimationMetrics.bind(manager),
    queueAnimation: manager.queueAnimation.bind(manager),
  };
}

/**
 * Hook for animation presets
 */
export function useAnimationPreset(
  presetName: string,
  options: Partial<AnimationOptions> = {}
) {
  const manager = getAnimationManager();
  
  return manager.createAnimationProps(presetName, options);
}

/**
 * Hook for reduced motion detection
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

// Import React hooks
import { useState, useEffect } from 'react';

// Utility functions

/**
 * Create smooth stagger animation for lists
 */
export function createStaggerAnimation(
  itemCount: number,
  staggerDelay: number = 0.1
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };
}

/**
 * Create progress animation for loading states
 */
export function createProgressAnimation(progress: number): Variants {
  return {
    empty: { scaleX: 0, originX: 0 },
    filled: {
      scaleX: progress / 100,
      originX: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };
}

/**
 * Create notification animation
 */
export function createNotificationAnimation(type: 'success' | 'error' | 'info'): Variants {
  const colors = {
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6',
  };

  return {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      backgroundColor: colors[type],
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };
}

// Export enhanced animation presets and sequences
export { ENHANCED_PRESETS, ENHANCED_SEQUENCES, DEFAULT_CONFIG };