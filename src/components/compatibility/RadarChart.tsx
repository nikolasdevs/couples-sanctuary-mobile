import { View } from "react-native";
import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";

import { DIMENSION_META, type Dimension } from "@/data/compatQuestions";
import type { DimensionScore } from "@/lib/compatScoring";

interface RadarChartProps {
  scores: DimensionScore[];
  size?: number;
}

export function RadarChart({ scores, size = 280 }: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 40; // padding for labels
  const n = scores.length;

  function polarToCart(angle: number, r: number): [number, number] {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [center + r * Math.cos(rad), center + r * Math.sin(rad)];
  }

  const angleStep = 360 / n;
  const rings = [0.25, 0.5, 0.75, 1];

  const points = scores.map((s, i) => {
    const pct = s.alignment / 100;
    return polarToCart(i * angleStep, radius * pct);
  });

  return (
    <View className="items-center">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map((r) => (
          <Polygon
            key={r}
            points={Array.from({ length: n })
              .map((_, i) => polarToCart(i * angleStep, radius * r).join(","))
              .join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {scores.map((_, i) => {
          const [x, y] = polarToCart(i * angleStep, radius);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          );
        })}

        {/* Score polygon */}
        <Polygon
          points={points.map((p) => p.join(",")).join(" ")}
          fill="rgba(139, 92, 246, 0.15)"
          stroke="#8b5cf6"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Score dots */}
        {points.map(([x, y], i) => (
          <Circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill={DIMENSION_META[scores[i].dimension as Dimension]?.color ?? "#8b5cf6"}
          />
        ))}

        {/* Labels */}
        {scores.map((s, i) => {
          const labelRadius = radius + 24;
          const [x, y] = polarToCart(i * angleStep, labelRadius);
          const meta = DIMENSION_META[s.dimension as Dimension];
          return (
            <SvgText
              key={i}
              x={x}
              y={y}
              fontSize={9}
              fill="rgba(255,255,255,0.5)"
              textAnchor="middle"
            >
              {meta?.icon ?? ""} {s.alignment}%
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
