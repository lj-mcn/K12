import React, { useEffect } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { StatusBar } from 'expo-status-bar'

export default function LoadingVideo({ route }) {
  const { onLoadingEnd } = route.params || {}

  useEffect(() => {
    // 2秒后自动完成loading
    const timer = setTimeout(() => {
      console.log('Loading finished')
      if (onLoadingEnd) {
        onLoadingEnd()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [onLoadingEnd])

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Text style={styles.loadingText}>幼教APP</Text>
      <Text style={styles.subText}>正在加载中...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  subText: {
    fontSize: 18,
    color: 'black',
  },
})
