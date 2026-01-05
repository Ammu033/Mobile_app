import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  iconname: string;
  onPress?: () => void;
}

export default function Button({ title, iconname, onPress }: ButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.iconWrapper}>
        <View style={styles.iconBg}>
          <MaterialCommunityIcons 
            name={iconname as any}
            size={40} 
            color="#fff" 
          />
        </View>
      </View>
      <Text style={styles.text} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: '#252d6e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  iconWrapper: {
    marginBottom: 12,
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#3d46b4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});