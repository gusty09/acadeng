import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../../constants/Colors';

interface FloatingActionProps {
  onAddProject: () => void;
  onQuickReport: () => void;
}

export function FloatingActionMenu({ onAddProject, onQuickReport }: FloatingActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rotateValue = useState(new Animated.Value(0))[0];

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.timing(rotateValue, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
  };

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const handleAddProject = () => {
    setIsOpen(false);
    onAddProject();
  };

  const handleQuickReport = () => {
    setIsOpen(false);
    onQuickReport();
  };

  return (
    <View style={styles.container}>
      {/* Action Items */}
      {isOpen && (
        <View style={styles.menuItems}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleQuickReport}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={20} color={Colors.accent} />
            <Text style={styles.menuText}>تقرير سريع</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleAddProject}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.menuText}>مشروع جديد</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={24} color={Colors.textOnPrimary} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    alignItems: 'flex-start',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItems: {
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    gap: Spacing.sm,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});