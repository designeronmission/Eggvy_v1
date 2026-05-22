// components/AddGroupModal.js
import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { height, width } = Dimensions.get('window');

// All available Feather icons
const ALL_ICONS = [
  'home', 'grid', 'layers', 'package', 'archive', 'inbox', 'server', 'database',
  'shopping-cart', 'shopping-bag', 'credit-card', 'dollar-sign', 'tag', 'gift', 
  'trending-up', 'trending-down', 'truck', 'navigation', 'map', 'compass', 
  'battery', 'watch', 'smartphone', 'car', 'coffee', 'droplet', 'heart', 'mic', 
  'music', 'film', 'book', 'video', 'tv', 'play', 'pause', 'skip-back', 
  'skip-forward', 'zap', 'wifi', 'bluetooth', 'phone', 'bell', 'cloud', 'sun', 
  'activity', 'moon', 'thermometer', 'wind', 'briefcase', 'code', 'command', 
  'cpu', 'printer', 'monitor', 'message-circle', 'mail', 'send', 'voicemail', 
  'rss', 'cast', 'airplay', 'shield', 'lock', 'unlock', 'key', 'settings', 
  'sliders', 'toggle-left', 'toggle-right', 'folder', 'star', 'flag', 'award', 
  'target', 'crosshair', 'pen-tool', 'edit-2', 'edit-3', 'trash-2', 'trash', 
  'plus', 'minus', 'check', 'x', 'help-circle', 'info', 'alert-circle', 
  'alert-triangle', 'refresh-cw', 'rotate-cw', 'rotate-ccw', 'download', 
  'upload', 'external-link', 'link', 'copy', 'save', 'printer', 'camera', 
  'image', 'video-off', 'mic-off', 'volume-1', 'volume-2', 'volume-x',
  'github', 'gitlab', 'git-commit', 'git-pull-request', 'git-merge', 
  'git-branch', 'feather', 'anchor', 'archive', 'at-sign', 'award',
  'bar-chart', 'bar-chart-2', 'battery-charging', 'bell-off', 'bluetooth',
  'book-open', 'bookmark', 'box', 'briefcase', 'calendar', 'camera-off',
  'cast', 'check-circle', 'check-square', 'chevron-down', 'chevron-left',
  'chevron-right', 'chevron-up', 'chevrons-down', 'chevrons-left',
  'chevrons-right', 'chevrons-up', 'circle', 'clipboard', 'clock',
  'cloud-drizzle', 'cloud-lightning', 'cloud-off', 'cloud-rain', 'cloud-snow',
  'codepen', 'codesandbox', 'coffee', 'columns', 'command', 'compass',
  'copy', 'corner-down-left', 'corner-down-right', 'corner-left-down',
  'corner-left-up', 'corner-right-down', 'corner-right-up', 'corner-up-left',
  'corner-up-right', 'cpu', 'credit-card', 'crop', 'crosshair', 'database',
  'delete', 'disc', 'divide', 'divide-circle', 'divide-square', 'dollar-sign',
  'download', 'download-cloud', 'dribbble', 'droplet', 'edit', 'edit-2',
  'edit-3', 'external-link', 'eye', 'eye-off', 'facebook', 'fast-forward',
  'feather', 'figma', 'file', 'file-minus', 'file-plus', 'file-text',
  'film', 'filter', 'flag', 'folder', 'folder-minus', 'folder-plus',
  'framer', 'frown', 'gift', 'git-branch', 'git-commit', 'git-merge',
  'git-pull-request', 'github', 'gitlab', 'globe', 'grid', 'hard-drive',
  'hash', 'headphones', 'heart', 'help-circle', 'hexagon', 'home', 'image',
  'inbox', 'info', 'instagram', 'italic', 'key', 'layers', 'layout',
  'life-buoy', 'link', 'link-2', 'linkedin', 'list', 'loader', 'lock',
  'log-in', 'log-out', 'mail', 'map', 'map-pin', 'maximize', 'maximize-2',
  'meh', 'menu', 'message-circle', 'message-square', 'mic', 'mic-off',
  'minimize', 'minimize-2', 'minus', 'minus-circle', 'minus-square',
  'monitor', 'moon', 'more-horizontal', 'more-vertical', 'mouse-pointer',
  'move', 'music', 'navigation', 'navigation-2', 'octagon', 'package',
  'paperclip', 'pause', 'pause-circle', 'pen-tool', 'percent', 'phone',
  'phone-call', 'phone-forwarded', 'phone-incoming', 'phone-missed',
  'phone-off', 'phone-outgoing', 'pie-chart', 'play', 'play-circle',
  'plus', 'plus-circle', 'plus-square', 'pocket', 'power', 'printer',
  'radio', 'refresh-cw', 'refresh-ccw', 'repeat', 'rewind', 'rotate-ccw',
  'rotate-cw', 'rss', 'save', 'scissors', 'search', 'send', 'server',
  'settings', 'share', 'share-2', 'shield', 'shield-off', 'shopping-bag',
  'shopping-cart', 'shuffle', 'sidebar', 'skip-back', 'skip-forward',
  'slack', 'slash', 'sliders', 'smartphone', 'smile', 'speaker', 'square',
  'star', 'stop-circle', 'sun', 'sunrise', 'sunset', 'tablet', 'tag',
  'target', 'terminal', 'thermometer', 'thumbs-down', 'thumbs-up',
  'toggle-left', 'toggle-right', 'tool', 'trash', 'trash-2', 'trello',
  'trending-down', 'trending-up', 'triangle', 'truck', 'tv', 'twitch',
  'twitter', 'type', 'umbrella', 'underline', 'unlock', 'upload',
  'upload-cloud', 'user', 'user-check', 'user-minus', 'user-plus',
  'user-x', 'users', 'video', 'video-off', 'voicemail', 'volume',
  'volume-1', 'volume-2', 'volume-x', 'watch', 'wifi', 'wifi-off',
  'wind', 'x', 'x-circle', 'x-octagon', 'x-square', 'youtube', 'zap',
  'zap-off', 'zoom-in', 'zoom-out'
];

// Categorized icons for better organization
const ICON_CATEGORIES = [
  {
    name: 'HOME & LIVING',
    icons: ['home', 'grid', 'layers', 'package', 'archive', 'inbox', 'server', 'database', 
            'folder', 'key', 'lock', 'unlock', 'shield', 'tool', 'hard-drive', 'box']
  },
  {
    name: 'SHOPPING & MONEY',
    icons: ['shopping-cart', 'shopping-bag', 'credit-card', 'dollar-sign', 'tag', 'gift', 
            'trending-up', 'trending-down', 'percent', 'pocket', 'save']
  },
  {
    name: 'TRANSPORTATION',
    icons: ['truck', 'navigation', 'navigation-2', 'map', 'map-pin', 'compass']
  },
  {
    name: 'FOOD & DRINK',
    icons: ['coffee', 'droplet']
  },
  {
    name: 'ENTERTAINMENT',
    icons: ['film', 'music', 'video', 'tv', 'play', 'pause', 'skip-back', 'skip-forward',
            'headphones', 'radio', 'speaker', 'fast-forward', 'rewind', 'youtube', 'twitch']
  },
  {
    name: 'HEALTH & FITNESS',
    icons: ['heart', 'activity', 'watch', 'smile', 'frown', 'meh', 'thermometer']
  },
  {
    name: 'BUSINESS & WORK',
    icons: ['briefcase', 'code', 'command', 'cpu', 'printer', 'monitor', 'terminal',
            'hard-drive', 'clipboard', 'edit', 'edit-2', 'edit-3', 'pen-tool']
  },
  {
    name: 'COMMUNICATION',
    icons: ['message-circle', 'message-square', 'mail', 'send', 'voicemail', 'rss', 
            'cast', 'airplay', 'phone', 'phone-call', 'phone-forwarded', 'phone-incoming',
            'phone-missed', 'phone-off', 'phone-outgoing', 'at-sign']
  },
  {
    name: 'SPORTS',
    icons: ['award', 'target', 'crosshair', 'octagon', 'hexagon', 'triangle']
  },
  {
    name: 'SOCIAL MEDIA',
    icons: ['github', 'gitlab', 'facebook', 'twitter', 'instagram', 'linkedin', 
            'dribbble', 'figma', 'slack', 'twitch', 'youtube', 'codepen', 'codesandbox']
  },
  {
    name: 'GENERAL',
    icons: ['star', 'flag', 'award', 'target', 'crosshair', 'pen-tool', 
            'edit-2', 'edit-3', 'trash-2', 'trash', 'plus', 'minus', 'check', 'x', 
            'help-circle', 'info', 'alert-circle', 'alert-triangle', 'refresh-cw', 
            'rotate-cw', 'rotate-ccw', 'download', 'upload', 'external-link', 'link', 
            'link-2', 'copy', 'save', 'camera', 'camera-off', 'image', 'video-off', 
            'mic-off', 'volume-1', 'volume-2', 'volume-x', 'volume', 'circle', 
            'square', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right']
  }
];

// Gradient color options
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

const AddGroupModal = ({ visible, onClose, onSave }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedGradient, setSelectedGradient] = useState(COLOR_GRADIENTS[0]);
  const [activeTab, setActiveTab] = useState('icon');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIcons, setFilteredIcons] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollViewRef = useRef(null);

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Filter icons based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredIcons([]);
    } else {
      const filtered = ALL_ICONS.filter(icon => 
        icon.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredIcons(filtered);
    }
  }, [searchQuery]);

  const handleSave = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    onSave(groupName, selectedIcon, selectedGradient[0]);
    resetForm();
  };

  const resetForm = () => {
    setGroupName('');
    setSelectedIcon('folder');
    setSelectedGradient(COLOR_GRADIENTS[0]);
    setActiveTab('icon');
    setSearchQuery('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}>
          
          {/* Drag Indicator */}
          <View style={styles.dragIndicator} />
          
          {/* Header - Fixed at top */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Create New Group</Text>
              <Text style={styles.modalSubtitle}>Organize your categories</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Icon name="x" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled">
            
            {/* Group Name Input */}
            <View style={styles.nameContainer}>
              <View style={styles.iconPreview}>
                <Icon name={selectedIcon} size={20} color="#3F2B96" />
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
                  Icons
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
                  Colors
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content based on tab */}
            {activeTab === 'icon' ? (
              <>
                {/* Search Bar for Icons */}
                <View style={styles.searchContainer}>
                  <Icon name="search" size={18} color="#64748B" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search icons..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Icon name="x" size={18} color="#64748B" />
                    </TouchableOpacity>
                  )}
                </View>

                {searchQuery.trim() !== '' ? (
                  // Search Results
                  <>
                    <Text style={styles.searchResultsTitle}>
                      Search Results ({filteredIcons.length})
                    </Text>
                    <View style={styles.iconRow}>
                      {filteredIcons.slice(0, 50).map((icon, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.iconButton,
                            selectedIcon === icon && styles.iconButtonSelected,
                            { 
                              backgroundColor: selectedIcon === icon ? `${selectedGradient[0]}15` : '#F8FAFC',
                              borderColor: selectedIcon === icon ? selectedGradient[0] : '#E2E8F0'
                            }
                          ]}
                          onPress={() => setSelectedIcon(icon)}>
                          <Icon name={icon} size={22} color={selectedIcon === icon ? selectedGradient[0] : '#64748B'} />
                        </TouchableOpacity>
                      ))}
                      {filteredIcons.length === 0 && (
                        <View style={styles.noResults}>
                          <Icon name="search" size={32} color="#94A3B8" />
                          <Text style={styles.noResultsText}>No icons found</Text>
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  // Categorized Icons
                  ICON_CATEGORIES.map((category, catIndex) => (
                    <View key={catIndex} style={styles.iconCategory}>
                      <Text style={styles.iconCategoryTitle}>{category.name}</Text>
                      <View style={styles.iconRow}>
                        {category.icons.slice(0, 20).map((icon, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.iconButton,
                              selectedIcon === icon && styles.iconButtonSelected,
                              { 
                                backgroundColor: selectedIcon === icon ? `${selectedGradient[0]}15` : '#F8FAFC',
                                borderColor: selectedIcon === icon ? selectedGradient[0] : '#E2E8F0'
                              }
                            ]}
                            onPress={() => setSelectedIcon(icon)}>
                            <Icon name={icon} size={22} color={selectedIcon === icon ? selectedGradient[0] : '#64748B'} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))
                )}
              </>
            ) : (
              // Color Tab Content
              <>
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
              </>
            )}

            {/* Bottom padding for scrolling */}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Action Buttons - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={selectedGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.saveButtonGradient}>
                <Icon name="check" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Create Group</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    maxHeight: height * 0.9,
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconPreview: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
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
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 8,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  noResultsText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  // Icon Styles
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
  // Color Styles
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
  bottomPadding: {
    height: 20,
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

export default AddGroupModal;