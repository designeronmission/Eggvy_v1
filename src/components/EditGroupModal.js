// components/EditGroupModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { height, width } = Dimensions.get('window');

// Categorized icons (same as AddGroupModal)
const ICON_CATEGORIES = [
  {
    name: 'Home & Living',
    icons: ['home', 'grid', 'layers', 'package', 'archive', 'inbox', 'server', 'database']
  },
  {
    name: 'Shopping & Money',
    icons: ['shopping-cart', 'shopping-bag', 'credit-card', 'dollar-sign', 'tag', 'gift', 'trending-up', 'trending-down']
  },
  {
    name: 'Transportation',
    icons: ['truck', 'navigation', 'map', 'compass', 'battery', 'watch', 'smartphone', 'sunrise']
  },
  {
    name: 'Food & Drink',
    icons: ['coffee', 'droplet', 'gift', 'heart', 'mic', 'music', 'film', 'book']
  },
  {
    name: 'Entertainment',
    icons: ['film', 'music', 'video', 'tv', 'play', 'pause', 'skip-back', 'skip-forward']
  },
  {
    name: 'Utilities',
    icons: ['zap', 'droplet', 'wifi', 'bluetooth', 'phone', 'bell', 'cloud', 'sun']
  },
  {
    name: 'Health & Fitness',
    icons: ['heart', 'activity', 'watch', 'sun', 'moon', 'thermometer', 'wind', 'droplet']
  },
  {
    name: 'Business & Work',
    icons: ['briefcase', 'code', 'command', 'cpu', 'printer', 'monitor', 'server', 'database']
  },
  {
    name: 'Communication',
    icons: ['message-circle', 'mail', 'phone', 'send', 'voicemail', 'rss', 'cast', 'airplay']
  },
  {
    name: 'Security & Settings',
    icons: ['shield', 'lock', 'unlock', 'key', 'settings', 'sliders', 'toggle-left', 'toggle-right']
  },
  {
    name: 'General',
    icons: ['folder', 'star', 'heart', 'flag', 'award', 'target', 'crosshair', 'pen-tool']
  }
];

// Gradient color options (same as AddGroupModal)
const COLOR_GRADIENTS = [
  ['#0A84FF', '#0066CC'], // Blue
  ['#FF2D55', '#CC2244'], // Red
  ['#34C759', '#2A9D8F'], // Green
  ['#FF9F0A', '#F97316'], // Orange
  ['#BF5AF2', '#A855F7'], // Purple
  ['#FF6482', '#E56772'], // Pink
  ['#5E5CE6', '#4F46E5'], // Indigo
  ['#FFB340', '#F59E0B'], // Yellow
  ['#30B0C0', '#0891B2'], // Cyan
  ['#FF453A', '#DC2626'], // Bright Red
  ['#32ADE6', '#0284C7'], // Light Blue
  ['#FF69A5', '#DB2777'], // Hot Pink
  ['#66BB6A', '#16A34A'], // Forest Green
  ['#FFA726', '#EA580C'], // Dark Orange
  ['#AB47BC', '#7E22CE'], // Deep Purple
  ['#EC407A', '#BE185D'], // Magenta
  ['#26A69A', '#0F766E'], // Teal
  ['#7E57C2', '#6B21A8'], // Violet
  ['#EF5350', '#B91C1C'], // Dark Red
  ['#5C6BC0', '#4338CA'], // Dark Blue
  ['#66BB6A', '#15803D'], // Dark Green
  ['#FFA270', '#C2410C'], // Peach
  ['#7C4DFF', '#5B21B6'], // Royal Purple
  ['#FF6E80', '#BE123C'], // Rose
  ['#3F2B96', '#2A1B6D'], // Dark Purple
  ['#E56772', '#B91C1C'], // Brick Red
  ['#2A9D8F', '#115E59'], // Dark Teal
  ['#E76F51', '#9A3412'], // Terracotta
  ['#2B2D42', '#1E1B4B'], // Navy
  ['#8D99AE', '#475569'], // Slate
];

const EditGroupModal = ({ visible, onClose, onSave, group, groupId }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedGradient, setSelectedGradient] = useState(COLOR_GRADIENTS[0]);
  const [activeTab, setActiveTab] = useState('icon');

  useEffect(() => {
    if (group) {
      setGroupName(group.name || '');
      setSelectedIcon(group.icon || 'folder');
      // Find gradient that matches the group color
      const matchingGradient = COLOR_GRADIENTS.find(g => g[0] === group.color) || COLOR_GRADIENTS[0];
      setSelectedGradient(matchingGradient);
    }
  }, [group]);

  const handleSave = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    onSave(groupId, groupName, selectedIcon, selectedGradient[0]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          {/* Drag Indicator */}
          <View style={styles.dragIndicator} />
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Edit Group</Text>
              <Text style={styles.modalSubtitle}>Update group details</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="x" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}>
            {/* Group Name Input */}
            <View style={styles.nameContainer}>
              <View style={styles.nameIcon}>
                <Icon name="edit-3" size={18} color="#3F2B96" />
              </View>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter group name"
                placeholderTextColor="#94A3B8"
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>

            {/* Preview Card */}
            <LinearGradient
              colors={selectedGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.previewCard}>
              <View style={styles.previewContent}>
                <View style={styles.previewIconContainer}>
                  <Icon name={selectedIcon} size={30} color="#FFFFFF" />
                </View>
                <View style={styles.previewTextContainer}>
                  <Text style={styles.previewLabel}>PREVIEW</Text>
                  <Text style={styles.previewName}>
                    {groupName.trim() || 'Group Name'}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'icon' && styles.activeTab]}
                onPress={() => setActiveTab('icon')}>
                <Icon 
                  name="grid" 
                  size={18} 
                  color={activeTab === 'icon' ? '#3F2B96' : '#64748B'} 
                />
                <Text style={[styles.tabText, activeTab === 'icon' && styles.activeTabText]}>
                  Choose Icon
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'color' && styles.activeTab]}
                onPress={() => setActiveTab('color')}>
                <Icon 
                  name="droplet" 
                  size={18} 
                  color={activeTab === 'color' ? '#3F2B96' : '#64748B'} 
                />
                <Text style={[styles.tabText, activeTab === 'color' && styles.activeTabText]}>
                  Choose Color
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content based on tab */}
            {activeTab === 'icon' ? (
              <View style={styles.iconContent}>
                {ICON_CATEGORIES.map((category) => (
                  <View key={category.name} style={styles.iconCategory}>
                    <Text style={styles.iconCategoryTitle}>{category.name}</Text>
                    <View style={styles.iconRow}>
                      {category.icons.map(icon => (
                        <TouchableOpacity
                          key={icon}
                          style={[
                            styles.iconButton,
                            selectedIcon === icon && styles.iconButtonSelected,
                            { 
                              backgroundColor: selectedIcon === icon ? `${selectedGradient[0]}15` : '#F8FAFC',
                              borderColor: selectedIcon === icon ? selectedGradient[0] : '#E2E8F0'
                            }
                          ]}
                          onPress={() => setSelectedIcon(icon)}>
                          <Icon 
                            name={icon} 
                            size={22} 
                            color={selectedIcon === icon ? selectedGradient[0] : '#64748B'} 
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.colorContent}>
                <Text style={styles.colorSectionTitle}>Select Gradient</Text>
                <View style={styles.colorGrid}>
                  {COLOR_GRADIENTS.map((gradient, index) => {
                    const isSelected = selectedGradient[0] === gradient[0];
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.gradientButton}
                        onPress={() => setSelectedGradient(gradient)}>
                        <LinearGradient
                          colors={gradient}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={[
                            styles.gradientCircle,
                            isSelected && styles.gradientCircleSelected
                          ]}>
                          {isSelected && (
                            <Icon name="check" size={20} color="#FFFFFF" />
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={selectedGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.saveButtonGradient}>
                <Icon name="check" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: '100%',
    maxHeight: height * 0.9, // 90% of screen height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nameIcon: {
    marginRight: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 12,
  },
  previewCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  previewIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#3F2B96',
  },
  iconContent: {
    marginBottom: 20,
  },
  iconCategory: {
    marginBottom: 24,
  },
  iconCategoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconButtonSelected: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorContent: {
    marginBottom: 20,
  },
  colorSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gradientButton: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  gradientCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default EditGroupModal;