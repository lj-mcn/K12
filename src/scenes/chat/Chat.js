import React, { useContext, useState, useRef } from 'react'
import {
  Text, View, StyleSheet, TouchableOpacity, Image, Animated, Dimensions,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { colors } from '../../theme'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'

const { width, height } = Dimensions.get('window')

export default function Chat() {
  const navigation = useNavigation()
  const { scheme } = useContext(ColorSchemeContext)
  const [isRecording, setIsRecording] = useState(false)
  const [lastMessage, setLastMessage] = useState('你好！我是你的AI小助手，按住按钮和我聊天吧！')
  const scaleAnim = useRef(new Animated.Value(1)).current
  
  const isDark = scheme === 'dark'
  const colorScheme = {
    background: isDark ? colors.black : colors.white,
    text: isDark ? colors.white : colors.primaryText,
  }

  const handlePressIn = () => {
    setIsRecording(true)
    setLastMessage('正在聆听...')
    
    // 按钮缩放动画
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      useNativeDriver: true,
    }).start()
    
    // 这里可以添加录音逻辑
    console.log('开始录音')
  }

  const handlePressOut = () => {
    setIsRecording(false)
    setLastMessage('处理中，请稍等...')
    
    // 恢复按钮大小
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
    
    // 模拟处理和回复
    setTimeout(() => {
      setLastMessage('我听到了你的话！这是一个很有趣的话题呢！')
    }, 2000)
    
    // 这里可以添加停止录音和处理音频的逻辑
    console.log('停止录音')
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
      {/* 标题栏 */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.titleText, { color: colorScheme.text }]}>
          智能聊天
        </Text>
      </View>

      {/* 中间的AI助手图片和对话区域 */}
      <View style={styles.chatContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../../assets/images/Component 12.png')}
            style={styles.avatarImage}
            resizeMode="contain"
          />
          
          {/* 状态指示器 */}
          <View style={[
            styles.statusIndicator,
            { backgroundColor: isRecording ? colors.success : colors.primary }
          ]}>
            <Text style={styles.statusText}>
              {isRecording ? '🎤' : '💬'}
            </Text>
          </View>
        </View>

        {/* 对话气泡 */}
        <View style={styles.messageContainer}>
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              {lastMessage}
            </Text>
          </View>
        </View>
      </View>

      {/* 底部的Push-to-Talk按钮 */}
      <View style={styles.bottomContainer}>
        <Text style={[styles.instructionText, { color: colorScheme.text }]}>
          按住按钮说话，松开发送
        </Text>
        
        <Animated.View style={[
          styles.recordButtonContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              {
                backgroundColor: isRecording ? colors.danger : colors.primary,
              }
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? '🎤 录音中' : '🎙️ 按住说话'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 录音状态提示 */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <Text style={styles.recordingText}>正在录音...</Text>
            <View style={styles.waveContainer}>
              <View style={[styles.wave, styles.wave1]} />
              <View style={[styles.wave, styles.wave2]} />
              <View style={[styles.wave, styles.wave3]} />
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  avatarImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  statusText: {
    fontSize: 16,
  },
  messageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  messageBubble: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 16,
    color: colors.primaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  recordButtonContainer: {
    marginBottom: 20,
  },
  recordButton: {
    width: 200,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.black,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  recordingIndicator: {
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: 10,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wave: {
    width: 4,
    backgroundColor: colors.danger,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  wave1: {
    height: 10,
  },
  wave2: {
    height: 20,
  },
  wave3: {
    height: 15,
  },
})