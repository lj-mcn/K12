import React, { useState, useContext, useEffect } from 'react'
import {
  Text, View, StyleSheet, ScrollView,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Avatar } from '@rneui/themed'
import Dialog from 'react-native-dialog'
import Spinner from 'react-native-loading-spinner-overlay'
import { useNavigation } from '@react-navigation/native'
import ScreenTemplate from '../../components/ScreenTemplate'
import Button from '../../components/Button'
import { supabase } from '../../../lib/supabase'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import { UserDataContext } from '../../context/UserDataContext'
import { colors, fontSize } from '../../theme'
import { Restart } from '../../utils/Restart'

export default function Profile() {
  const { userData, setUserData } = useContext(UserDataContext)
  const navigation = useNavigation()
  const [visible, setVisible] = useState(false)
  const [spinner, setSpinner] = useState(false)
  const { scheme } = useContext(ColorSchemeContext)
  const isDark = scheme === 'dark'
  const colorScheme = {
    text: isDark ? colors.white : colors.primaryText,
  }

  useEffect(() => {
    console.log('Profile screen')
  }, [])

  const goDetail = () => {
    navigation.navigate('Edit', { userData })
  }

  const onSignOutPress = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.log(error.message)
      } else {
        await Restart()
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const showDialog = () => {
    setVisible(true)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const accountDelete = async () => {
    try {
      setSpinner(true)

      // Delete user profile from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userData.id)

      if (profileError) {
        console.error('Error deleting profile:', profileError)
      }

      // Delete push tokens if they exist
      const { error: tokenError } = await supabase
        .from('tokens')
        .delete()
        .eq('id', userData.id)

      if (tokenError) {
        console.error('Error deleting tokens:', tokenError)
      }

      // Delete user account from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userData.id)

      if (authError) {
        console.error('Error deleting user account:', authError)
        setSpinner(false)
        return
      }

      // Sign out after successful deletion
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.log(signOutError.message)
      }

      setSpinner(false)
      console.log('user deleted')
    } catch (error) {
      console.log(error)
      setSpinner(false)
    }
  }

  return (
    <ScreenTemplate>
      <View style={[styles.main, styles.whiteBackground]}>
        <View style={styles.avatar}>
          <Avatar
            size="large"
            rounded
            source={{ uri: userData.avatar_url || userData.avatar }}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.fieldLabel, { color: colorScheme.text }]}>姓名:</Text>
          <BlurView intensity={55} tint="regular" style={styles.textBackground}>
            <Text style={[styles.fieldValue, styles.timesFont, { color: colorScheme.text }]}>{userData.full_name || userData.fullName}</Text>
          </BlurView>
          <Text style={[styles.fieldLabel, { color: colorScheme.text }]}>邮箱:</Text>
          <BlurView intensity={55} tint="regular" style={styles.textBackground}>
            <Text style={[styles.fieldValue, styles.timesFont, { color: colorScheme.text }]}>{userData.email}</Text>
          </BlurView>
        </View>
        <View style={styles.buttonsContainer}>
          <Button
            label="编辑"
            color="#FFB366"
            style3D
            compact
            onPress={goDetail}
            style={styles.squareButton}
          />
          <Button
            label="打开弹窗"
            color="#FF8C42"
            style3D
            compact
            onPress={() => {
              navigation.navigate('ModalStacks', {
                screen: 'Post',
                params: {
                  data: userData,
                  from: 'Profile screen',
                },
              })
            }}
            style={styles.squareButton}
          />
          <Button
            label="删除账户"
            color="#E65100"
            style3D
            compact
            onPress={showDialog}
            style={styles.squareButton}
          />
        </View>
        <View style={styles.footerView}>
          <Text onPress={onSignOutPress} style={styles.footerLink}>退出登录</Text>
        </View>
      </View>
      <Dialog.Container visible={visible}>
        <Dialog.Title>删除账户</Dialog.Title>
        <Dialog.Description>
          您确定要删除此账户吗？此操作无法撤销。
        </Dialog.Description>
        <Dialog.Button label="取消" onPress={handleCancel} />
        <Dialog.Button label="删除" onPress={accountDelete} />
      </Dialog.Container>
      <Spinner
        visible={spinner}
        textStyle={{ color: colors.white }}
        overlayColor="rgba(0,0,0,0.5)"
      />
    </ScreenTemplate>
  )
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
  },
  infoContainer: {
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  textBackground: {
    marginVertical: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  fieldLabel: {
    fontSize: fontSize.middle,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  fieldValue: {
    fontSize: fontSize.xLarge,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  timesFont: {
    fontFamily: 'Times New Roman',
  },
  avatar: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  footerView: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerLink: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: fontSize.large,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  squareButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginHorizontal: 5,
    marginVertical: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteBackground: {
    backgroundColor: colors.white,
  },
})
