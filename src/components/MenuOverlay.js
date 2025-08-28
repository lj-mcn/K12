import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions,
} from 'react-native'
import { colors, fontSize } from '../theme'

const { width, height } = Dimensions.get('window')

const MenuOverlay = ({
  visible, onClose, isDark, onBackToVillage,
}) => {
  const colorScheme = {
    text: isDark ? colors.white : colors.primaryText,
    background: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)',
    menuBackground: isDark ? '#2a2a2a' : colors.offWhite,
    buttonBackground: isDark ? '#444' : '#f8f9fa',
  }

  const menuItems = [
    { id: 1, title: '🏠 回到垃圾村', action: 'backToVillage' },
    { id: 2, title: '💬 来聊天吧', action: 'goToChat' },
    { id: 3, title: '👗 打扮一下', action: 'dressUp' },
    { id: 4, title: '👨‍👩‍👧‍👦 村民家族', action: 'villagerFamily' },
    { id: 5, title: '🐔 养鸡场的终极对决', action: 'chickenBattle' },
    { id: 6, title: '⚙️ 我的设置', action: 'settings' },
  ]

  const handleMenuItemPress = (action) => {
    console.log('菜单项点击:', action)
    // 这里可以根据不同的action执行不同的导航或功能
    switch (action) {
      case 'backToVillage':
        // 重新开始流程：提示弹窗 → 视频 → 主页
        if (onBackToVillage) {
          onBackToVillage()
        }
        break
      case 'goToChat':
        // 进入聊天页面
        break
      case 'dressUp':
        // 打开装扮页面
        break
      case 'villagerFamily':
        // 查看村民家族
        break
      case 'chickenBattle':
        // 进入养鸡场对决
        break
      case 'settings':
        // 打开设置页面
        break
      default:
        break
    }
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: colorScheme.background }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.menuContainer, { backgroundColor: colorScheme.menuBackground }]}>
          <View style={styles.menuHeader}>
            <Text style={[styles.menuTitle, { color: colorScheme.text }]}>
              🎮 游戏菜单
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuContent}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  { backgroundColor: colorScheme.buttonBackground },
                  index === menuItems.length - 1 && styles.lastMenuItem,
                ]}
                onPress={() => handleMenuItemPress(item.action)}
                activeOpacity={0.7}
              >
                <Text style={[styles.menuItemText, { color: colorScheme.text }]}>
                  {item.title}
                </Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.menuFooter}>
            <Text style={[styles.footerText, { color: colorScheme.text }]}>
              嘎巴龙的奇幻世界 ✨
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  menuContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.black,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuTitle: {
    fontSize: fontSize.xLarge,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  menuContent: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 10,
    marginVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.black,
  },
  lastMenuItem: {
    marginBottom: 10,
  },
  menuItemText: {
    fontSize: fontSize.large,
    fontWeight: '500',
    flex: 1,
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  menuFooter: {
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.small,
    opacity: 0.6,
    fontStyle: 'italic',
  },
})

export default MenuOverlay
