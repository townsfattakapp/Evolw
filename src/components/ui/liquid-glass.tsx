import {
  useCallback,
  useRef,
  type ButtonHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/utils';

type GlassVariant =
  | 'regular'
  | 'clear'
  | 'hero'
  | 'chip'
  | 'nav'
  | 'dense'
  | 'panel'
  | 'control';

const VARIANT: Record<GlassVariant, string> = {
  regular: 'liquid-glass liquid-glass--regular',
  clear: 'liquid-glass liquid-glass--clear',
  hero: 'liquid-glass liquid-glass--hero',
  chip: 'liquid-glass liquid-glass--chip',
  nav: 'liquid-glass liquid-glass--nav',
  dense: 'liquid-glass liquid-glass--dense',
  panel: 'liquid-glass liquid-glass--panel',
  control: 'liquid-glass liquid-glass--control',
};

const REST_X = '30%';
const REST_Y = '8%';

type LiquidGlassProps = HTMLAttributes<HTMLElement> &
  Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled'> & {
    variant?: GlassVariant;
    as?: ElementType;
    interactive?: boolean;
    children?: ReactNode;
  };

/**
 * iOS 26 Liquid Glass — translucent, refractive, specular highlight tracks pointer.
 */
export function LiquidGlass({
  variant = 'regular',
  as: Tag = 'div',
  interactive = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: LiquidGlassProps) {
  const ref = useRef<HTMLElement | null>(null);

  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  const handleMove = (e: ReactPointerEvent<HTMLElement>) => {
    onPointerMove?.(e);
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    const y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
    ref.current.style.setProperty('--lg-x', `${x}%`);
    ref.current.style.setProperty('--lg-y', `${y}%`);
  };

  const handleLeave = (e: ReactPointerEvent<HTMLElement>) => {
    onPointerLeave?.(e);
    ref.current?.style.setProperty('--lg-x', REST_X);
    ref.current?.style.setProperty('--lg-y', REST_Y);
  };

  return (
    <Tag
      ref={setRef}
      className={cn(VARIANT[variant], interactive && 'liquid-glass--interactive', className)}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...props}
    >
      {children}
    </Tag>
  );
}
