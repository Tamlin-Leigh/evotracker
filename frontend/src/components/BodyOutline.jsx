import { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { formatBodyPartLabel } from '../config/bodyParts';
import { BODY_LANDMARKS, IMAGE_SIZE } from '../config/bodyLandmarks';
import bodyImage from '../assets/body.png';

const DOT_RADIUS = 18;
const DOT_RADIUS_ACTIVE = 24;
// Real clicks rarely land dead-center on a small dot, so the clickable area
// is a much more generous invisible circle around each visible dot.
const HIT_RADIUS = 55;

// The source image has a lot of empty margin around the figure; crop to this
// box (in the image's native pixel space) so the figure fills the frame.
const CROP = { x: 380, y: 30, width: 650, height: 1970 };
export const DISPLAY_WIDTH = 165;
const SCALE = DISPLAY_WIDTH / CROP.width;
const DISPLAY_HEIGHT = CROP.height * SCALE;

export default function BodyOutline({ selectedPart, onSelectPart }) {
  const theme = useTheme();
  const [hoveredPart, setHoveredPart] = useState(null);
  const displayPart = hoveredPart || selectedPart;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#f7f9fa', borderRadius: 1, py: 2 }}>
        <Box sx={{ position: 'relative', width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT, overflow: 'hidden' }}>
          <Box
            component="img"
            src={bodyImage}
            alt="Body outline"
            draggable={false}
            sx={{
              position: 'absolute',
              width: IMAGE_SIZE.width * SCALE,
              height: IMAGE_SIZE.height * SCALE,
              left: -CROP.x * SCALE,
              top: -CROP.y * SCALE,
              userSelect: 'none',
              maxWidth: 'none',
            }}
          />
          <Box
            component="svg"
            viewBox={`${CROP.x} ${CROP.y} ${CROP.width} ${CROP.height}`}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            {Object.entries(BODY_LANDMARKS).map(([id, [cx, cy]]) => {
              const isSelected = selectedPart === id;
              const isHovered = hoveredPart === id;
              const active = isSelected || isHovered;
              return (
                <g key={id}>
                  {/* Generous invisible hit area — the visible dot is too small to be a reliable click target on its own. */}
                  <circle
                    data-part={id}
                    cx={cx}
                    cy={cy}
                    r={HIT_RADIUS}
                    fill="transparent"
                    pointerEvents="all"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPart(id)}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => onSelectPart(id)}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={active ? DOT_RADIUS_ACTIVE : DOT_RADIUS}
                    fill={isSelected ? theme.palette.primary.main : isHovered ? theme.palette.primary.light : 'rgba(255,255,255,0.85)'}
                    stroke={theme.palette.primary.main}
                    strokeWidth={isSelected ? 0 : 2}
                    style={{ transition: 'r 100ms ease, fill 100ms ease' }}
                    pointerEvents="none"
                  />
                </g>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" align="center" mt={1}>
        {displayPart ? `${formatBodyPartLabel(displayPart)}${hoveredPart ? '' : ' selected'}` : 'Click a dot to log a measurement'}
      </Typography>
    </Box>
  );
}
