/**
 * Unified Video Game HUD Styling System
 * All hovering cards and panels should use these styles for consistency
 */

export const HUD_COLORS = {
  primary: '#0891B2',
  background: 'linear-gradient(135deg, #0a0a0a95, #1a1a1a90)',
  borderPrimary: (color: string) => `2px solid ${color}80`,
  borderAccent: (color: string) => `4px solid ${color}`,
};

export const HUD_EFFECTS = {
  backdropBlur: 'blur(12px)',
  glow: (color: string) => `0 0 20px ${color}40`,
  glowStrong: (color: string) => `0 0 30px ${color}60`,
  textShadow: (color: string) => `0 0 10px ${color}80`,
};

/**
 * Base HUD Container Style
 */
export const getHUDContainerStyle = (color: string = '#0891B2') => ({
  background: 'linear-gradient(135deg, #0a0a0a95, #1a1a1a90)',
  backdropFilter: 'blur(12px)',
  border: `2px solid ${color}80`,
  borderRadius: '4px',
  boxShadow: `0 0 20px ${color}40`,
  fontFamily: '"Courier New", monospace',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
});

/**
 * Corner Accent Component
 */
export const CornerAccents = ({ color = '#0891B2' }: { color?: string }) => (
  <>
    {/* Top Left */}
    <div style={{
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      width: '20px',
      height: '20px',
      borderTop: `4px solid ${color}`,
      borderLeft: `4px solid ${color}`,
    }} />
    {/* Top Right */}
    <div style={{
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      width: '20px',
      height: '20px',
      borderTop: `4px solid ${color}`,
      borderRight: `4px solid ${color}`,
    }} />
    {/* Bottom Left */}
    <div style={{
      position: 'absolute',
      bottom: '-2px',
      left: '-2px',
      width: '20px',
      height: '20px',
      borderBottom: `4px solid ${color}`,
      borderLeft: `4px solid ${color}`,
    }} />
    {/* Bottom Right */}
    <div style={{
      position: 'absolute',
      bottom: '-2px',
      right: '-2px',
      width: '20px',
      height: '20px',
      borderBottom: `4px solid ${color}`,
      borderRight: `4px solid ${color}`,
    }} />
  </>
);

/**
 * HUD Divider
 */
export const HUDDivider = ({ color = '#0891B2' }: { color?: string }) => (
  <div style={{
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
    margin: '12px 0',
  }} />
);

/**
 * HUD Title Style
 */
export const getHUDTitleStyle = (color: string = '#0891B2') => ({
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  textShadow: `0 0 10px ${color}60`,
});

/**
 * HUD Subtitle Style
 */
export const getHUDSubtitleStyle = (color: string = '#0891B2') => ({
  color: color,
  fontSize: '12px',
  margin: '0 0 8px 0',
  opacity: 0.9,
  fontWeight: '600',
  letterSpacing: '0.5px',
});

/**
 * HUD Text Style
 */
export const getHUDTextStyle = () => ({
  color: '#cccccc',
  fontSize: '11px',
  lineHeight: '1.6',
  margin: '0',
});

/**
 * HUD Action Button Style
 */
export const getHUDActionStyle = (color: string = '#0891B2') => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  background: `${color}15`,
  border: `1px solid ${color}40`,
  borderRadius: '2px',
  color: color,
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

/**
 * Complete HUD Panel Component
 */
interface HUDPanelProps {
  title: string;
  subtitle?: string;
  description?: string;
  color?: string;
  actionText?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

export const HUDPanel = ({
  title,
  subtitle,
  description,
  color = '#0891B2',
  actionText,
  compact = false,
  children,
}: HUDPanelProps) => {
  return (
    <div style={{
      ...getHUDContainerStyle(color),
      padding: compact ? '12px' : '16px',
      minWidth: compact ? '180px' : '240px',
      maxWidth: '400px',
      position: 'relative',
    }}>
      <CornerAccents color={color} />

      {/* Title */}
      <h3 style={getHUDTitleStyle(color)}>
        {title}
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p style={getHUDSubtitleStyle(color)}>
          {subtitle}
        </p>
      )}

      {/* Divider */}
      {!compact && <HUDDivider color={color} />}

      {/* Description */}
      {description && (
        <p style={getHUDTextStyle()}>
          {description}
        </p>
      )}

      {/* Custom Content */}
      {children}

      {/* Action Text */}
      {actionText && (
        <div style={{
          ...getHUDActionStyle(color),
          marginTop: compact ? '8px' : '12px',
        }}>
          {actionText}
        </div>
      )}

      {/* Noise Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ffffff02 2px, #ffffff02 4px)',
        pointerEvents: 'none',
        opacity: 0.3,
        borderRadius: '4px',
      }} />
    </div>
  );
};
