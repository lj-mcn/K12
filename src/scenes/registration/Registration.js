import React, { useState, useContext, useEffect } from 'react'
import {
  Text, StyleSheet, View, Linking, TouchableOpacity,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Spinner from 'react-native-loading-spinner-overlay'
import { useNavigation, useRoute } from '@react-navigation/native'
import ScreenTemplate from '../../components/ScreenTemplate'
import TextInputBox from '../../components/TextInputBox'
import Button from '../../components/Button'
import Logo from '../../components/Logo'
import EmailVerification from '../../components/EmailVerification'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize } from '../../theme'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import { UserDataContext } from '../../context/UserDataContext'
import { AppContext } from '../../context/AppContext'
import { useAppFlow } from '../../context/AppFlowContext'
import { defaultAvatar, eulaLink } from '../../config'

export default function Registration() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [spinner, setSpinner] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [userRegistrationData, setUserRegistrationData] = useState(null)
  const [guestName, setGuestName] = useState('')
  const [guestAge, setGuestAge] = useState(1)
  const navigation = useNavigation()
  const route = useRoute()
  const { scheme } = useContext(ColorSchemeContext)
  const { setUserData } = useContext(UserDataContext)
  const { setLoggedIn, setChecked } = useContext(AppContext)
  const { markLoginCompleted } = useAppFlow()
  
  const isGuestMode = route.params?.guestMode
  const isDark = scheme === 'dark'
  const colorScheme = {
    text: isDark ? '#ffffff' : '#000000',
  }

  useEffect(() => {
    console.log('Registration screen')
  }, [])

  const onFooterLinkPress = () => {
    navigation.navigate('Login')
  }

  const onRegisterPress = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      console.error('Registration validation failed: Missing required fields')
      // alert('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      console.error('Registration validation failed: Passwords do not match')
      // alert("Passwords don't match.")
      return
    }

    if (password.length < 6) {
      console.error('Registration validation failed: Password too short')
      // alert('Password should be at least 6 characters long.')
      return
    }

    try {
      setSpinner(true)
      console.log('Sending OTP to email:', email)

      // Send OTP for registration
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            full_name: fullName,
            avatar_url: defaultAvatar,
            password, // Store password temporarily for verification
          },
        },
      })

      if (error) {
        throw error
      }

      console.log('OTP sent successfully')
      console.log('Please check your email for verification code')

      // Store registration data for verification
      const registrationData = {
        email,
        fullName,
        password,
        defaultAvatar,
      }

      // Show verification screen
      setRegisteredEmail(email)
      setUserRegistrationData(registrationData)
      setShowVerification(true)
      setSpinner(false)
    } catch (error) {
      console.error('Registration error:', error.message)
      setSpinner(false)

      let errorMessage = '注册失败，请重试'
      switch (error.message) {
        case 'User already registered':
          errorMessage = '此邮箱地址已被使用'
          break
        case 'Invalid email':
          errorMessage = '邮箱地址格式无效'
          break
        case 'Password should be at least 6 characters':
          errorMessage = '密码至少需要6个字符'
          break
        case 'Unable to validate email address: invalid format':
          errorMessage = '邮箱地址格式无效'
          break
        default:
          errorMessage = error.message || '发生了意外错误'
      }

      console.error('Registration error message:', errorMessage)
      // alert(errorMessage)
    }
  }

  const onVerificationComplete = () => {
    setShowVerification(false)
    navigation.navigate('Login')
  }

  const handleGuestComplete = () => {
    if (!guestName.trim()) {
      console.error('Guest name validation failed: Missing name')
      return
    }

    // 创建游客用户数据
    const guestUserData = {
      id: 'guest_' + Date.now(),
      full_name: guestName,
      email: 'guest@local.app',
      age: guestAge,
      isGuest: true,
      avatar_url: defaultAvatar,
    }

    console.log('Guest registration completed:', guestUserData)
    setUserData(guestUserData)
    setLoggedIn(true)
    setChecked(true)
    markLoginCompleted()
  }

  const increaseAge = () => {
    setGuestAge(prev => prev + 1)
  }

  const decreaseAge = () => {
    if (guestAge > 1) {
      setGuestAge(prev => prev - 1)
    }
  }

  if (showVerification) {
    return (
      <ScreenTemplate>
        <EmailVerification
          email={registeredEmail}
          isRegistration
          registrationData={userRegistrationData}
          onVerificationComplete={onVerificationComplete}
        />
        <Spinner
          visible={spinner}
          textStyle={{ color: '#ffffff' }}
          overlayColor="rgba(0,0,0,0.5)"
        />
      </ScreenTemplate>
    )
  }

  if (isGuestMode) {
    return (
      <ScreenTemplate>
        <KeyboardAwareScrollView
          style={styles.main}
          keyboardShouldPersistTaps="always"
        >
          <Logo />
          <View style={styles.guestContainer}>
            <Text style={[styles.guestTitle, { color: colorScheme.text }]}>初始化信息</Text>
            
            {/* 姓名输入 */}
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colorScheme.text }]}>我叫：</Text>
              <TextInputBox
                placeholder="请输入姓名"
                onChangeText={setGuestName}
                value={guestName}
                style={styles.nameInput}
              />
            </View>

            {/* 年龄选择器 */}
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colorScheme.text }]}>我</Text>
              <TouchableOpacity
                style={[styles.ageButton, guestAge <= 1 && styles.ageButtonDisabled]}
                onPress={decreaseAge}
                disabled={guestAge <= 1}
              >
                <Text style={[styles.ageButtonText, guestAge <= 1 && styles.ageButtonTextDisabled]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.ageText, { color: colorScheme.text }]}>{guestAge}</Text>
              <TouchableOpacity
                style={styles.ageButton}
                onPress={increaseAge}
              >
                <Text style={styles.ageButtonText}>+</Text>
              </TouchableOpacity>
              <Text style={[styles.inputLabel, { color: colorScheme.text }]}>岁了</Text>
            </View>

            <Button
              label="完成"
              onPress={handleGuestComplete}
            />
          </View>
        </KeyboardAwareScrollView>
      </ScreenTemplate>
    )
  }

  return (
    <ScreenTemplate>
      <KeyboardAwareScrollView
        style={styles.main}
        keyboardShouldPersistTaps="always"
      >
        <Logo />
        <TextInputBox
          placeholder="您的姓名"
          onChangeText={(text) => setFullName(text)}
          value={fullName}
          autoCapitalize="none"
        />
        <TextInputBox
          placeholder="邮箱地址"
          onChangeText={(text) => setEmail(text)}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInputBox
          secureTextEntry
          placeholder="密码"
          onChangeText={(text) => setPassword(text)}
          value={password}
          autoCapitalize="none"
        />
        <TextInputBox
          secureTextEntry
          placeholder="确认密码"
          onChangeText={(text) => setConfirmPassword(text)}
          value={confirmPassword}
          autoCapitalize="none"
        />
        <Button
          label="同意并创建账户"
          onPress={() => onRegisterPress()}
        />
        <View style={styles.footerView}>
          <Text style={[styles.footerText, { color: colorScheme.text }]}>已有账户？ <Text onPress={onFooterLinkPress} style={styles.footerLink}>立即登录</Text></Text>
        </View>
        <Text style={[styles.link, { color: colorScheme.text }]} onPress={() => { Linking.openURL(eulaLink) }}>需要同意 <Text style={styles.eulaLink}>用户协议</Text></Text>
      </KeyboardAwareScrollView>
      <Spinner
        visible={spinner}
        textStyle={{ color: '#ffffff' }}
        overlayColor="rgba(0,0,0,0.5)"
      />
    </ScreenTemplate>
  )
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
  },
  guestContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  nameInput: {
    flex: 1,
    maxWidth: 200,
  },
  ageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5dc',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  ageButtonDisabled: {
    backgroundColor: '#aaaaaa',
    borderColor: '#aaaaaa',
  },
  ageButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  ageButtonTextDisabled: {
    color: '#797777',
  },
  ageText: {
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  footerView: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: fontSize.large,
  },
  footerLink: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: fontSize.large,
  },
  link: {
    textAlign: 'center',
  },
  eulaLink: {
    color: '#000000',
    fontSize: fontSize.middle,
  },
})
