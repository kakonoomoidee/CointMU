import { useState, useEffect } from 'react'

interface Biometrics {
  isSupported: boolean
}

/**
 * Detects whether the current device exposes a user-verifying platform
 * authenticator (Touch ID, Windows Hello, etc.) via the WebAuthn API. The check
 * runs once on mount and resolves to false on any unsupported or failing path.
 * @returns An object with the resolved isSupported flag.
 */
export function useBiometrics(): Biometrics {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    let active = true
    const check = async (): Promise<void> => {
      try {
        const supported = window.PublicKeyCredential
          ? await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          : false
        if (active) setIsSupported(supported)
      } catch {
        if (active) setIsSupported(false)
      }
    }
    void check()
    return () => {
      active = false
    }
  }, [])

  return { isSupported }
}
