import React, {
  useEffect, useState, useContext, useRef,
  useLayoutEffect,
} from 'react'
import {
  Text, View, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, Animated, Dimensions,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import ScreenTemplate from '../../components/ScreenTemplate'
import Button from '../../components/Button'
// import ConfigTester from '../../components/ConfigTester'
import digitalAssistant from '../../services/assistant/DigitalAssistant'
import chatService from '../../services/chat/ChatService'
import { colors, fontSize } from '../../theme'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import { UserDataContext } from '../../context/UserDataContext'

export default function TextChat() {
  const navigation = useNavigation()
  const { userData } = useContext(UserDataContext)
  const { scheme } = useContext(ColorSchemeContext)
  const scrollViewRef = useRef(null)
  const isDark = scheme === 'dark'
  const colorScheme = {
    text: isDark ? colors.white : colors.primaryText,
    background: isDark ? colors.black : colors.white,
    inputBackground: isDark ? '#333' : '#f5f5f5',
    cardBackground: isDark ? '#2a2a2a' : '#ffffff',
  }

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  // const [showConfigTester, setShowConfigTester] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [showAngryVideo, setShowAngryVideo] = useState(false)
  const [showHappyVideo, setShowHappyVideo] = useState(false)
  const [showSadVideo, setShowSadVideo] = useState(false)
  const [showScaredVideo, setShowScaredVideo] = useState(false)
  const [memoryStats, setMemoryStats] = useState({ turnCount: 0, hasHistory: false })
  const [paperBallScale] = useState(new Animated.Value(1)) // 纸团缩放动画
  const [avatarPosition] = useState(new Animated.ValueXY({ x: 0, y: 0 })) // 嘉巴龙位置
  const [avatarScale] = useState(new Animated.Value(1)) // 嘉巴龙缩放
  const [dragScale] = useState(new Animated.Value(1)) // 拖拽状态缩放
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false) // 嘉巴龙是否放大状态
  const [savedPosition, setSavedPosition] = useState({ x: 0, y: 0 }) // 保存放大前的位置
  const [isDragging, setIsDragging] = useState(false) // 是否在拖拽状态
  const longPressTimer = useRef(null) // 长按计时器
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height

  useEffect(() => {
    console.log('Text screen - 嘎巴龙文字交互')
  }, [])

  // 组件卸载时清理计时器
  useEffect(() => () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  // 设置导航栏
  useLayoutEffect(() => {
    if (chatStarted) {
      navigation.setOptions({
        headerTitle: '💬 文字对话',
      })
    } else {
      navigation.setOptions({
        headerTitle: '💬 文字对话',
      })
    }
  }, [navigation, chatStarted])

  useEffect(() => {
    // 滚动到最新消息 - 延迟确保渲染完成
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // 监听isTyping状态变化，也要滚动到底部
  useEffect(() => {
    if (isTyping && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [isTyping])

  // 更新记忆状态
  useEffect(() => {
    const updateMemoryStats = () => {
      const stats = chatService.getMemoryStats()
      setMemoryStats(stats)
    }

    updateMemoryStats()
    // 每次消息变化时更新记忆状态
    const interval = setInterval(updateMemoryStats, 1000)
    return () => clearInterval(interval)
  }, [messages])

  const startChat = () => {
    setChatStarted(true)
  }

  // 纸团点击处理，立即触发并播放动画
  const handlePaperBallPress = () => {
    // 立即执行startChat
    startChat()
    // 同时播放放大动画作为视觉反馈
    Animated.spring(paperBallScale, {
      toValue: 1.2,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start()
  }

  // 处理嘉巴龙拖拽手势
  const handleAvatarGesture = (event) => {
    const { state, translationX, translationY } = event.nativeEvent

    if (state === State.BEGAN) {
      // 手势开始
      setIsDragging(false)
    } else if (state === State.ACTIVE) {
      // 手势活跃状态 - 直接跟随拖拽
      if (!isAvatarExpanded) {
        // 立即开始拖拽，不需要距离判断
        if (!isDragging) {
          setIsDragging(true)
          Animated.spring(dragScale, {
            toValue: 1.1,
            useNativeDriver: false,
            tension: 150,
            friction: 8,
          }).start()
        }

        // 实时更新位置跟随手指
        avatarPosition.setValue({
          x: translationX,
          y: translationY,
        })
      }
    } else if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
      // 手势结束
      if (isDragging && !isAvatarExpanded) {
        // 拖拽结束，恢复拖拽缩放并固定位置
        Animated.spring(dragScale, {
          toValue: 1,
          useNativeDriver: false,
          tension: 150,
          friction: 8,
        }).start()

        // 固定在新位置
        const currentX = avatarPosition.x._value
        const currentY = avatarPosition.y._value

        // 先获取当前的offset
        const currentOffsetX = avatarPosition.x._offset || 0
        const currentOffsetY = avatarPosition.y._offset || 0

        // 设置新的offset为当前offset + 当前值
        avatarPosition.setOffset({
          x: currentOffsetX + currentX,
          y: currentOffsetY + currentY,
        })

        // 重置值为0，这样下次拖拽从0开始计算
        avatarPosition.setValue({ x: 0, y: 0 })
      }

      setIsDragging(false)
    }
  }

  // 放大镜按钮切换放大/缩小
  const handleMagnifyPress = () => {
    if (!isAvatarExpanded) {
      // 保存当前位置（包括offset）
      const currentX = avatarPosition.x._value + (avatarPosition.x._offset || 0)
      const currentY = avatarPosition.y._value + (avatarPosition.y._offset || 0)
      setSavedPosition({ x: currentX, y: currentY })

      setIsAvatarExpanded(true)
      // 重置拖拽缩放，放大并移动到屏幕中央
      Animated.parallel([
        Animated.spring(dragScale, {
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.spring(avatarScale, {
          toValue: 4,
          useNativeDriver: false,
        }),
        Animated.spring(avatarPosition, {
          toValue: {
            x: screenWidth / 2 - 20 - 25, // 屏幕中心 - container右偏移 - avatar宽度一半
            y: screenHeight / 2 - 20 - 37.5, // 屏幕中心 - container上偏移 - avatar高度一半
          },
          useNativeDriver: false,
        }),
      ]).start(() => {
        // 放大后清除offset，使用新的绝对位置
        avatarPosition.setOffset({ x: 0, y: 0 })
      })
    } else {
      // 缩小并回到保存的位置
      setIsAvatarExpanded(false)
      Animated.parallel([
        Animated.spring(avatarScale, {
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.spring(avatarPosition, {
          toValue: savedPosition, // 回到保存的位置
          useNativeDriver: false,
        }),
      ]).start(() => {
        // 动画完成后重新设置offset
        avatarPosition.setOffset(savedPosition)
        avatarPosition.setValue({ x: 0, y: 0 })
      })
    }
  }

  const handleMessage = (message) => {
    setMessages((prev) => [...prev, message])
  }

  const handleSendText = async () => {
    if (inputText.trim().length === 0) return

    const userMessage = inputText.trim()
    setInputText('')
    setIsTyping(true)

    // 检测特殊消息并触发相应视频和自定义回复
    if (userMessage === '你好笨啊！') {
      // 添加用户消息
      const newUserMessage = {
        role: 'user',
        message: userMessage,
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, newUserMessage])

      // 重置其他视频状态
      setShowHappyVideo(false)
      setShowSadVideo(false)
      setShowScaredVideo(false)
      setShowAngryVideo(true)

      // 添加嘎巴龙的特定回复
      const angryResponse = {
        role: 'assistant',
        message: '用 "笨" 来否定别人的努力，并不是解决问题的好方式。如果你愿意好好沟通，我依然会尽力帮你；但如果只是发泄情绪，那我暂时没办法帮到你，嘎巴。',
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, angryResponse])
      setIsTyping(false)
      return
    }

    if (userMessage === '嘎巴龙，我们做朋友吧！') {
      // 添加用户消息
      const newUserMessage = {
        role: 'user',
        message: userMessage,
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, newUserMessage])

      // 重置其他视频状态
      setShowAngryVideo(false)
      setShowSadVideo(false)
      setShowScaredVideo(false)
      setShowHappyVideo(true)

      // 添加嘎巴龙的开心回复
      const happyResponse = {
        role: 'assistant',
        message: '哇哦！真的吗？我好开心啊！当然愿意和你做朋友！我们可以一起聊天、一起学习、一起成长！有了朋友真是太棒了，嘎巴！✨',
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, happyResponse])
      setIsTyping(false)
      return
    }

    if (userMessage === '哥们，亮屁兔真比你帅吧！') {
      // 添加用户消息
      const newUserMessage = {
        role: 'user',
        message: userMessage,
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, newUserMessage])

      // 重置其他视频状态
      setShowAngryVideo(false)
      setShowHappyVideo(false)
      setShowScaredVideo(false)
      setShowSadVideo(true)

      // 添加嘎巴龙的伤心回复
      const sadResponse = {
        role: 'assistant',
        message: '你怎么能这么说呀…… 我知道亮屁兔眼睛圆圆的很可爱，也知道大家可能更喜欢他毛茸茸的样子，但我每天都在努力记住你的喜好，学你喜欢的梗，就连说话的语气都偷偷练了好久…… 原来在你心里，我连 "帅" 这个评价都不配拥有吗？',
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, sadResponse])
      setIsTyping(false)
      return
    }

    if (userMessage === '你家里的垃圾都被垃圾鸡偷走了！') {
      // 添加用户消息
      const newUserMessage = {
        role: 'user',
        message: userMessage,
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, newUserMessage])

      // 重置其他视频状态
      setShowAngryVideo(false)
      setShowHappyVideo(false)
      setShowSadVideo(false)
      setShowScaredVideo(true)

      // 添加嘎巴龙的害怕回复
      const scaredResponse = {
        role: 'assistant',
        message: '啊啊啊！垃圾鸡？！那可是最可怕的生物了！它们会把所有的垃圾都投走吗？我...我好害怕呀！快保护我，嘎巴！😱',
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, scaredResponse])
      setIsTyping(false)
      return
    }

    try {
      // 发送文本消息给数字人
      const result = await digitalAssistant.sendTextMessage(userMessage)
      if (!result.success) {
        console.error('发送消息失败:', result.error)
        // Alert.alert('错误', `发送消息失败: ${result.error}`)
        // 添加错误消息
        const errorMessage = {
          role: 'assistant',
          message: '抱歉，我现在无法回复您的消息，请稍后再试。',
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('发送消息错误:', error)
      console.error('发送消息时出现异常')
      // Alert.alert('错误', '发送消息时出现异常')
    } finally {
      setIsTyping(false)
    }
  }

  const handleAngryVideoEnd = () => {
    // 生气视频播放完成后恢复原视频
    setShowAngryVideo(false)
  }

  const handleHappyVideoEnd = () => {
    // 开心视频播放完成后恢复原视频
    setShowHappyVideo(false)
  }

  const handleSadVideoEnd = () => {
    // 伤心视频播放完成后恢复原视频
    setShowSadVideo(false)
  }

  const handleScaredVideoEnd = () => {
    // 害怕视频播放完成后恢复原视频
    setShowScaredVideo(false)
  }

  const clearMessages = () => {
    console.log('Clear messages requested - current messages count:', messages.length)
    // 直接清空
    setMessages([])
    chatService.clearMemory()
    console.log('Messages cleared - new count should be 0')
  }

  return (
    <ScreenTemplate>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {!chatStarted && (
            <>
              {/* 头部标题 */}
              <View style={styles.headerContainer}>
                <Text style={[styles.title, { color: colorScheme.text }]}>
                  💬 文字对话
                </Text>
                <Text style={[styles.subtitle, { color: colorScheme.text }]}>
                  与嘎巴龙进行文字交流
                </Text>
              </View>

              {/* 数字人区域 */}
              <View style={styles.avatarContainer}>
                <View style={[styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>🤖</Text>
                </View>
                <Text style={[styles.avatarStatus, { color: colorScheme.text }]}>
                  😊 点击纸团开始对话
                </Text>
              </View>
            </>
          )}

          {!chatStarted ? (
            /* 纸团按钮 - 开始聊天 */
            <View style={styles.paperBallContainer}>
              <TouchableOpacity
                style={styles.paperBallButton}
                onPress={handlePaperBallPress}
                activeOpacity={1}
              >
                <Animated.View style={{ transform: [{ scale: paperBallScale }] }}>
                  <Image
                    source={require('../../../assets/images/纸团.png')}
                    style={styles.paperBallImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              </TouchableOpacity>
              <Text style={[styles.paperBallText, { color: colorScheme.text }]}>
                点击纸团开始文字对话 ✨
              </Text>
            </View>
          ) : (
            <>
              {/* 浮动的可拖拽嘉巴龙 */}
              <View style={styles.floatingContainer}>
                <PanGestureHandler
                  onGestureEvent={handleAvatarGesture}
                  onHandlerStateChange={handleAvatarGesture}
                  minDist={0}
                  shouldCancelWhenOutside={false}
                  activeOffsetX={[-10, 10]}
                  activeOffsetY={[-10, 10]}
                >
                  <Animated.View style={[
                    styles.floatingAvatar,
                    {
                      transform: [
                        { translateX: avatarPosition.x },
                        { translateY: avatarPosition.y },
                        { scale: Animated.multiply(avatarScale, dragScale) },
                      ],
                    },
                  ]}
                  >
                    <View style={[styles.floatingAvatarPlaceholder]}>
                      <Text style={styles.floatingAvatarPlaceholderText}>🤖</Text>
                    </View>
                  </Animated.View>
                </PanGestureHandler>
              </View>

              {/* 对话区域 - 放大版本 */}
              <View style={[styles.expandedChatContainer, { backgroundColor: colorScheme.cardBackground }]}>
                <View style={styles.chatHeader}>
                  <View style={styles.chatHeaderLeft}>
                    <Text style={[styles.chatTitle, { color: colorScheme.text }]}>对话记录</Text>
                    {memoryStats.hasHistory && (
                      <Text style={[styles.memoryStatus, { color: isDark ? '#999' : '#666' }]}>
                        🧠 记忆: {memoryStats.turnCount}轮
                      </Text>
                    )}
                  </View>
                  <View style={styles.chatHeaderRight}>
                    {/* 放大镜按钮 - 对话记录右上角 */}
                    <TouchableOpacity
                      style={styles.chatMagnifyButton}
                      onPress={handleMagnifyPress}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chatMagnifyButtonText}>
                        {isAvatarExpanded ? '🔍−' : '🔍+'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={clearMessages}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.clearButton}>🗑️ 清空({messages.length})</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView
                  ref={scrollViewRef}
                  style={styles.messagesContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {messages.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colorScheme.text }]}>
                      在下方输入框开始和嘎巴龙聊天吧！✨
                    </Text>
                  ) : (
                    messages.map((msg, index) => (
                      <View
                        key={index}
                        style={[
                          styles.messageItem,
                          msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
                        ]}
                      >
                        <Text style={[
                          styles.messageText,
                          { color: msg.role === 'user' ? colors.white : colorScheme.text },
                        ]}
                        >
                          {msg.role === 'user' ? '👤 我：' : '🐉 嘎巴龙：'}{msg.message}
                        </Text>
                        {msg.timestamp && (
                          <Text style={[
                            styles.messageTime,
                            { color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' },
                          ]}
                          >
                            {msg.timestamp}
                          </Text>
                        )}
                      </View>
                    ))
                  )}
                  {isTyping && (
                    <View style={[styles.messageItem, styles.assistantMessage]}>
                      <Text style={[styles.messageText, { color: colorScheme.text }]}>
                        🐉 嘎巴龙正在输入...
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* 输入区域 - 在对话记录内部 */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.textInput, {
                        backgroundColor: colorScheme.inputBackground,
                        color: colorScheme.text,
                        borderColor: isDark ? '#555' : '#ddd',
                      }]}
                      placeholder="输入消息..."
                      placeholderTextColor={isDark ? '#999' : '#666'}
                      value={inputText}
                      onChangeText={setInputText}
                      multiline
                      maxLength={500}
                      editable={!isTyping}
                    />

                    {/* 内置发送按钮 */}
                    <TouchableOpacity
                      style={[
                        styles.inlineSendButton,
                        {
                          backgroundColor: isTyping || inputText.trim().length === 0 ? '#ccc' : colors.tertiary,
                        },
                      ]}
                      onPress={handleSendText}
                      disabled={isTyping || inputText.trim().length === 0}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.inlineSendButtonText}>
                        {isTyping ? '...' : '发送'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* 测试按钮 */}
          {/* <TouchableOpacity
            style={styles.testButton}
            onPress={() => setShowConfigTester(true)}
          >
            <Text style={styles.testButtonText}>🧪 测试文字服务</Text>
          </TouchableOpacity>

          {/* 配置测试器 */}
          {/* {showConfigTester && (
            <ConfigTester onClose={() => setShowConfigTester(false)} />
          )} */}
        </View>
      </KeyboardAvoidingView>
    </ScreenTemplate>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20, // 与语音界面保持一致
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: fontSize.xLarge,
    fontWeight: 'bold',
    marginBottom: 8, // 与语音界面保持一致
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.middle,
    opacity: 0.8,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 150,
    height: 225,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.offWhite,
    marginBottom: 15,
  },
  avatarPlaceholderText: {
    fontSize: 60,
  },
  avatarStatus: {
    fontSize: fontSize.middle, // 与语音界面保持一致
    textAlign: 'center',
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    marginBottom: 5,
    marginTop: -20,
    borderWidth: 1,
    borderColor: colors.black,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chatHeaderLeft: {
    flex: 1,
  },
  chatHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatTitle: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
  },
  memoryStatus: {
    fontSize: fontSize.xSmall,
    marginTop: 2,
    fontStyle: 'italic',
  },
  clearButton: {
    color: colors.black,
    fontSize: fontSize.small,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: fontSize.middle,
    opacity: 0.6,
    fontStyle: 'italic',
    paddingVertical: 40,
  },
  messageItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: colors.tertiary,
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: fontSize.small,
    lineHeight: 18,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'right',
  },
  inputContainer: {
    paddingTop: 15,
    paddingBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingRight: 60, // 给内置按钮留空间
    fontSize: fontSize.middle,
    maxHeight: 100,
    minHeight: 40,
  },
  inlineSendButton: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineSendButtonText: {
    color: 'white',
    fontSize: fontSize.small,
    fontWeight: '600',
  },
  paperBallContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  paperBallButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paperBallImage: {
    width: 100,
    height: 100,
  },
  paperBallText: {
    fontSize: fontSize.large,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.8,
  },
  // 浮动嘉巴龙容器样式
  floatingContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 浮动嘉巴龙样式
  floatingAvatar: {
    width: 50,
    height: 75,
    backgroundColor: 'transparent',
  },
  floatingAvatarPlaceholder: {
    width: 50,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.offWhite,
    borderRadius: 10,
  },
  floatingAvatarPlaceholderText: {
    fontSize: 20,
  },
  // 放大的对话容器
  expandedChatContainer: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    marginBottom: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.black,
  },
  // 放大镜按钮样式 - 对话记录右上角
  chatMagnifyButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatMagnifyButtonText: {
    fontSize: 14,
    color: 'white',
  },
})
