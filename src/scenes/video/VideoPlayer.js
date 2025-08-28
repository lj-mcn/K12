import React, { useRef, useEffect, useState } from 'react'
import {
  View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal,
} from 'react-native'
import { Video, Audio } from 'expo-av'
import { StatusBar } from 'expo-status-bar'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useAppFlow } from '../../context/AppFlowContext'

const { width, height } = Dimensions.get('window')

export default function VideoPlayer() {
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const route = useRoute()
  const navigation = useNavigation()
  const { markVideoWatched } = useAppFlow()
  const isReturnToVillage = route.params?.mode === 'returnToVillage'
  const musicEnabled = route.params?.musicEnabled ?? true

  console.log('VideoPlayer params:', route.params)
  console.log('Music enabled:', musicEnabled)
  const [showSkipButton, setShowSkipButton] = useState(false)

  useEffect(() => {
    const initializeAudioVideo = async () => {
      try {
        // 设置音频模式 - 使用简化配置
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
        })

        console.log('Audio mode set, musicEnabled:', musicEnabled)

        // 如果启用音乐，加载并播放背景音乐
        if (musicEnabled) {
          console.log('Loading background music...')
          try {
            // 先尝试加载音频文件
            const musicAsset = require('../../../assets/music/Mixdown.mp3')
            console.log('Music asset loaded:', musicAsset)

            const { sound } = await Audio.Sound.createAsync(
              musicAsset,
              {
                isLooping: true,
                volume: 0.8,
                shouldPlay: true,
              },
            )
            audioRef.current = sound

            // 获取音频状态
            const status = await sound.getStatusAsync()
            console.log('Audio status:', status)
            console.log('Background music loaded and playing')
          } catch (audioError) {
            console.log('Error loading audio:', audioError)
            console.log('Audio error details:', JSON.stringify(audioError, null, 2))
          }
        } else {
          console.log('Music disabled by user')
        }

        // 自动播放视频
        if (videoRef.current) {
          await videoRef.current.playAsync()
        }
      } catch (error) {
        console.log('Error in initializeAudioVideo:', error)
      }
    }

    initializeAudioVideo()

    // 清理函数
    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync().catch(console.log)
      }
    }
  }, [musicEnabled])


  useEffect(() => {
    // 2秒后显示跳过按键
    const timer = setTimeout(() => {
      setShowSkipButton(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleVideoEnd = async () => {
    // 停止背景音乐
    if (audioRef.current) {
      try {
        await audioRef.current.stopAsync()
        await audioRef.current.unloadAsync()
        audioRef.current = null
      } catch (error) {
        console.log('Error stopping audio:', error)
      }
    }

    // 视频结束后标记已观看，然后跳转到登录界面
    console.log('Video finished, marking as watched')
    markVideoWatched()
  }

  const handleSkipVideo = () => {
    console.log('User skipped village video')
    setShowSkipButton(false)
    handleVideoEnd()
  }




  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Video
        ref={videoRef}
        style={styles.video}
        source={require('../../../assets/images/垃圾村漫游视频.mp4')}
        useNativeControls={false}
        resizeMode="cover"
        isLooping={false}
        shouldPlay
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            handleVideoEnd()
          }
        }}
      />
      {showSkipButton && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipVideo}
        >
          <Text style={styles.skipButtonText}>跳过</Text>
        </TouchableOpacity>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width,
    height,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#f5f5dc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000000',
  },
  skipButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
