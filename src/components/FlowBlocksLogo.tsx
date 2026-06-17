import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  size?: number;
  showWordmark?: boolean;
}

// Block geometry as ratios of the icon bounding box (based on a 52x52 grid).
const BLOCKS = [
  { x: 8 / 52, y: 30 / 52, opacity: 1 },
  { x: 16 / 52, y: 16 / 52, opacity: 0.78 },
  { x: 24 / 52, y: 2 / 52, opacity: 0.55 },
];
const BLOCK_W = 24 / 52;
const BLOCK_H = 14 / 52;

export function FlowBlocksLogo({ size = 28, showWordmark = true }: Props) {
  const blockWidth = size * BLOCK_W;
  const blockHeight = size * BLOCK_H;
  const radius = Math.max(2, size * 0.08);

  return (
    <View style={styles.row}>
      <View style={{ width: size, height: size }}>
        {BLOCKS.map((b, i) => (
          <LinearGradient
            key={i}
            colors={[colors.accentFrom, colors.accentTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.block,
              {
                left: size * b.x,
                top: size * b.y,
                width: blockWidth,
                height: blockHeight,
                borderRadius: radius,
                opacity: b.opacity,
              },
            ]}
          />
        ))}
      </View>

      {showWordmark ? (
        <Text style={styles.wordmark}>
          <Text style={styles.flow}>Flow</Text>
          <Text style={styles.blocks}>Blocks</Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  block: {
    position: 'absolute',
  },
  wordmark: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  flow: {
    color: colors.textPrimary,
  },
  blocks: {
    color: colors.accentFrom,
  },
});
