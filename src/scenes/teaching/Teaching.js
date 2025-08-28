import React, { useContext, useState, useRef } from 'react'
import {
  Text, View, StyleSheet, TouchableOpacity, Image, Dimensions,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Video } from 'expo-av'
import { colors } from '../../theme'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'

const { width, height } = Dimensions.get('window')

export default function Teaching() {
  const navigation = useNavigation()
  const route = useRoute()
  const { subject } = route.params || { subject: '语文' }
  const { scheme } = useContext(ColorSchemeContext)
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const isDark = scheme === 'dark'
  const colorScheme = {
    background: isDark ? colors.black : colors.white,
    text: isDark ? colors.white : colors.primaryText,
  }

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync()
      } else {
        await videoRef.current.playAsync()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
      {/* 标题 */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.titleText, { color: colorScheme.text }]}>
          {subject}课堂
        </Text>
      </View>

      {/* 视频区域（上半部分） */}
      <View style={styles.videoContainer}>
        <Image
          source={require('../../../assets/images/Component 12.png')}
          style={styles.videoPlaceholder}
          resizeMode="cover"
        />
        {/* 播放按钮覆盖层 */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 互动区域（下半部分） */}
      <View style={styles.interactionContainer}>
        <Text style={[styles.lessonTitle, { color: colorScheme.text }]}>
          今天我们学习{subject}
        </Text>
        <Text style={[styles.lessonDescription, { color: colorScheme.text }]}>
          点击上方视频开始学习，老师会引导你完成今天的课程内容
        </Text>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.actionButtonText}>开始练习</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
            <Text style={styles.actionButtonText}>查看作业</Text>
          </TouchableOpacity>
        </View>
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
  videoContainer: {
    height: height * 0.4,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
  },
  interactionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  lessonDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 120,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})