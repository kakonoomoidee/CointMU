import { useState, useEffect } from 'react'

interface UsbLike {
  getDevices: () => Promise<unknown[]>
  addEventListener: (type: 'connect' | 'disconnect', listener: () => void) => void
  removeEventListener: (type: 'connect' | 'disconnect', listener: () => void) => void
}

/**
 * Resolves the WebUSB interface from the renderer's navigator when available.
 * WebUSB is not part of the standard DOM typings, so it is accessed through a
 * narrow local shape rather than a global declaration.
 * @returns The WebUSB-like object, or null when WebUSB is unsupported.
 */
function getUsb(): UsbLike | null {
  const candidate = (navigator as Navigator & { usb?: UsbLike }).usb
  return candidate ?? null
}

/**
 * Detects whether any USB device is currently connected via the WebUSB API. The
 * initial value is seeded from navigator.usb.getDevices(), and connect and
 * disconnect events keep it in sync as the user plugs or unplugs a device.
 * @returns The current hasDevice flag.
 */
export function useHardwareDetection(): boolean {
  const [hasDevice, setHasDevice] = useState(false)

  useEffect(() => {
    const usb = getUsb()
    if (!usb) return

    let active = true

    const refresh = async (): Promise<void> => {
      try {
        const devices = await usb.getDevices()
        if (active) setHasDevice(devices.length > 0)
      } catch {
        if (active) setHasDevice(false)
      }
    }

    const handleConnect = (): void => {
      if (active) setHasDevice(true)
    }
    const handleDisconnect = (): void => {
      void refresh()
    }

    void refresh()
    usb.addEventListener('connect', handleConnect)
    usb.addEventListener('disconnect', handleDisconnect)

    return () => {
      active = false
      usb.removeEventListener('connect', handleConnect)
      usb.removeEventListener('disconnect', handleDisconnect)
    }
  }, [])

  return hasDevice
}
