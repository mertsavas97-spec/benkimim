import { StyleSheet, View } from 'react-native';
import type { Difficulty } from '../engine/types';
import { difficultyColor, space } from '../theme/tokens';

type Props = {
  difficulty: Difficulty;
};

export function DifficultyDots({ difficulty }: Props) {
  const levels: Difficulty[] = ['easy', 'medium', 'hard'];
  const activeIndex = levels.indexOf(difficulty);
  return (
    <View style={styles.row} accessibilityLabel={`Zorluk: ${difficulty}`}>
      {levels.map((d, i) => (
        <View
          key={d}
          style={[
            styles.dot,
            {
              backgroundColor: i <= activeIndex ? difficultyColor(difficulty) : '#3A3D48',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
