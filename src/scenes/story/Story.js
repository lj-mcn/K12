import React, { useContext, useState, useRef } from 'react'
import {
  Text, View, StyleSheet, TouchableOpacity, Image, Dimensions, StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Video } from 'expo-av'
import { colors } from '../../theme'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'

const { width, height } = Dimensions.get('window')

export default function Story() {
  const navigation = useNavigation()
  const { scheme } = useContext(ColorSchemeContext)
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
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

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const storyList = [
    { id: 1, title: '小红帽', duration: '5分钟' },
    { id: 2, title: '三只小猪', duration: '7分钟' },
    { id: 3, title: '白雪公主', duration: '10分钟' },
    { id: 4, title: '灰姑娘', duration: '8分钟' },
  ]

  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <Image
          source={require('../../../assets/images/Component 12.png')}
          style={styles.fullscreenVideo}
          resizeMode="contain"
        />
        
        {/* 全屏控制按钮 */}
        <TouchableOpacity
          style={styles.fullscreenPlayButton}
          onPress={handlePlayPause}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitFullscreenButton}
          onPress={handleFullscreen}
        >
          <Text style={styles.exitFullscreenText}>退出全屏</Text>
        </TouchableOpacity>
      </View>
    )
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
          故事时间
        </Text>
      </View>

      {/* 视频播放区域 */}
      <View style={styles.videoContainer}>
        <Image
          source={require('../../../assets/images/Component 12.png')}
          style={styles.videoPlaceholder}
          resizeMode="cover"
        />
        
        {/* 播放控制按钮 */}
        <View style={styles.controlsOverlay}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
          >
            <Text style={styles.playButtonText}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.fullscreenToggle}
            onPress={handleFullscreen}
          >
            <Text style={styles.fullscreenText}>全屏</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 故事列表 */}
      <View style={styles.storyListContainer}>
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          更多故事
        </Text>
        
        {storyList.map((story) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyItem}
            onPress={() => console.log(`选择了故事: ${story.title}`)}
          >
            <View style={styles.storyIcon}>
              <Text style={styles.storyIconText}>📚</Text>
            </View>
            <View style={styles.storyInfo}>
              <Text style={[styles.storyTitle, { color: colorScheme.text }]}>
                {story.title}
              </Text>
              <Text style={[styles.storyDuration, { color: colors.gray }]}>
                {story.duration}
              </Text>
            </View>
            <Text style={styles.playIcon}>▶️</Text>
          </TouchableOpacity>
        ))}
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
    height: height * 0.3,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  playButtonText: {
    fontSize: 20,
  },
  fullscreenToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 6,
  },
  fullscreenText: {
    color: colors.white,
    fontSize: 12,
  },
  storyListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  storyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: colors.lightGray,
    borderRadius: 10,
  },
  storyIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  storyIconText: {
    fontSize: 20,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storyDuration: {
    fontSize: 12,
  },
  playIcon: {
    fontSize: 16,
    marginLeft: 10,
  },
  // 全屏样式
  fullscreenContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideo: {
    width: height, // 横屏时宽度变为原来的高度
    height: width, // 横屏时高度变为原来的宽度
    transform: [{ rotate: '90deg' }],
  },
  fullscreenPlayButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitFullscreenButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  exitFullscreenText: {
    color: colors.white,
    fontSize: 14,
  },
})