import { useState, useEffect, useRef } from 'react'
import Input from '../forms/Input'

function ColorPicker({ color, h, s, l, onChange, onClose }) {
  const [hue, setHue] = useState(h !== undefined ? h : 0)
  const [saturation, setSaturation] = useState(s !== undefined ? s : 100)
  const [lightness, setLightness] = useState(l !== undefined ? l : 50)
  const [alpha, setAlpha] = useState(color?.a || 255)
  const [hex, setHex] = useState('#FF0000')
  const [rgb, setRgb] = useState({ r: 255, g: 0, b: 0 })
  const [colorMode, setColorMode] = useState('HSL')
  const originalColorRef = useRef(null)
  const originalAlphaRef = useRef(255)
  const colorWheelRef = useRef(null)
  const [isDraggingWheel, setIsDraggingWheel] = useState(false)
  const [isDraggingHue, setIsDraggingHue] = useState(false)
  const [isDraggingSat, setIsDraggingSat] = useState(false)
  const hueBarRef = useRef(null)
  const satBarRef = useRef(null)

  useEffect(() => {
    if (color) {
      const hexColor = typeof color === 'string' ? color : color.hex
      
      // Use existing h, s, l from color object if available, otherwise calculate
      if (color.h !== undefined && color.s !== undefined && color.l !== undefined) {
        setHue(color.h)
        setSaturation(color.s)
        setLightness(color.l)
      } else {
        const result = hexToHSL(hexColor)
        setHue(result.h)
        setSaturation(result.s)
        setLightness(result.l)
      }
      
      setHex(hexColor)
      const rgbResult = hexToRGB(hexColor)
      setRgb(rgbResult)
      setAlpha(color?.a || 255)
      
      // Only set original color once when picker opens
      if (!originalColorRef.current) {
        originalColorRef.current = hexColor
        originalAlphaRef.current = color?.a || 255
      }
    }
  }, [color])

  const hexToHSL = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255
    let g = parseInt(hex.slice(3, 5), 16) / 255
    let b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  const hexToRGB = (hex) => {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    }
  }

  const hslToHex = (h, s, l) => {
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = (n) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const updateColor = (h, s, l) => {
    setHue(h)
    setSaturation(s)
    setLightness(l)
    const newHex = hslToHex(h, s, l).toUpperCase()
    setHex(newHex)
    const newRgb = hexToRGB(newHex)
    setRgb(newRgb)
    setAlpha(currentAlpha => {
      onChange({ hex: newHex, r: newRgb.r, g: newRgb.g, b: newRgb.b, a: currentAlpha, h, s, l })
      return currentAlpha
    })
  }

  const handleWheelClick = (e, currentLightness) => {
    const rect = colorWheelRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const angle = Math.atan2(y, x)
    const newHue = ((angle * 180 / Math.PI + 360) % 360)
    const distance = Math.sqrt(x * x + y * y)
    const maxDistance = rect.width / 2
    const newSaturation = Math.min(100, (distance / maxDistance) * 100)
    updateColor(Math.round(newHue), Math.round(newSaturation), currentLightness)
  }

  const handleHexChange = (e) => {
    let value = e.target.value.toUpperCase()
    if (!value.startsWith('#')) value = '#' + value
    
    // Check for 8-digit hex (with alpha)
    if (/^#[0-9A-F]{8}$/.test(value)) {
      const hexColor = value.slice(0, 7)
      const alphaHex = value.slice(7, 9)
      const newAlpha = parseInt(alphaHex, 16)
      
      setHex(hexColor)
      setAlpha(newAlpha)
      const hsl = hexToHSL(hexColor)
      setHue(hsl.h)
      setSaturation(hsl.s)
      setLightness(hsl.l)
      const newRgb = hexToRGB(hexColor)
      setRgb(newRgb)
      onChange({ hex: hexColor, r: newRgb.r, g: newRgb.g, b: newRgb.b, a: newAlpha, h: hsl.h, s: hsl.s, l: hsl.l })
    }
    // Check for 6-digit hex (without alpha)
    else if (/^#[0-9A-F]{6}$/.test(value)) {
      setHex(value)
      const hsl = hexToHSL(value)
      setHue(hsl.h)
      setSaturation(hsl.s)
      setLightness(hsl.l)
      const newRgb = hexToRGB(value)
      setRgb(newRgb)
      setAlpha(currentAlpha => {
        onChange({ hex: value, r: newRgb.r, g: newRgb.g, b: newRgb.b, a: currentAlpha, h: hsl.h, s: hsl.s, l: hsl.l })
        return currentAlpha
      })
    }
    // For incomplete input, just update the display
    else {
      setHex(value.slice(0, 7))
    }
  }

  const handleRGBChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: parseInt(value) || 0 }
    setRgb(newRgb)
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setHex(newHex)
    const hsl = hexToHSL(newHex)
    setHue(hsl.h)
    setSaturation(hsl.s)
    setLightness(hsl.l)
    setAlpha(currentAlpha => {
      onChange({ hex: newHex, r: newRgb.r, g: newRgb.g, b: newRgb.b, a: currentAlpha, h: hsl.h, s: hsl.s, l: hsl.l })
      return currentAlpha
    })
  }

  const handleOk = () => {
    onChange({ hex, r: rgb.r, g: rgb.g, b: rgb.b, a: alpha, h: hue, s: saturation, l: lightness })
    onClose()
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingWheel) {
        handleWheelClick(e, lightness)
      }
      if (isDraggingHue && hueBarRef.current) {
        const rect = hueBarRef.current.getBoundingClientRect()
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))
        const newHue = Math.round((y / rect.height) * 360)
        updateColor(newHue, saturation, lightness)
      }
      if (isDraggingSat && satBarRef.current) {
        const rect = satBarRef.current.getBoundingClientRect()
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))
        const newLightness = Math.round(50 - (y / rect.height) * 50)
        updateColor(hue, saturation, newLightness)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingWheel(false)
      setIsDraggingHue(false)
      setIsDraggingSat(false)
    }

    if (isDraggingWheel || isDraggingHue || isDraggingSat) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingWheel, isDraggingHue, isDraggingSat, lightness, hue, saturation])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700 shadow-2xl select-none" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">Color Picker</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div
              ref={colorWheelRef}
              className="w-48 h-48 rounded-full cursor-crosshair relative"
              style={{
                background: `conic-gradient(from 90deg, 
                  hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), 
                  hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), 
                  hsl(360, 100%, 50%))`,
              }}
              onMouseDown={(e) => {
                setIsDraggingWheel(true)
                handleWheelClick(e, lightness)
              }}
            >
              <div className="absolute inset-0 rounded-full" style={{
                background: `radial-gradient(circle, white 0%, transparent 70%)`
              }} />
              <div 
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg"
                style={{
                  left: `calc(50% + ${Math.cos(hue * Math.PI / 180) * (saturation / 100) * 96}px - 8px)`,
                  top: `calc(50% + ${Math.sin(hue * Math.PI / 180) * (saturation / 100) * 96}px - 8px)`,
                }}
              />
            </div>

            <div className="flex gap-2">
              <div 
                ref={hueBarRef}
                className="w-6 h-48 rounded cursor-pointer relative"
                style={{
                  background: `linear-gradient(to bottom, 
                    hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), 
                    hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), 
                    hsl(360, 100%, 50%))`
                }}
                onMouseDown={(e) => {
                  setIsDraggingHue(true)
                  const rect = e.currentTarget.getBoundingClientRect()
                  const y = e.clientY - rect.top
                  const newHue = Math.round((y / rect.height) * 360)
                  updateColor(newHue, saturation, lightness)
                }}
              >
                <div 
                  className="absolute w-full h-1 border-2 border-white shadow-lg"
                  style={{
                    top: `${(hue / 360) * 100}%`,
                    transform: 'translateY(-50%)'
                  }}
                />
              </div>

              <div 
                ref={satBarRef}
                className="w-6 h-48 rounded cursor-pointer relative"
                style={{
                  background: `linear-gradient(to bottom, hsl(${hue}, ${saturation}%, 50%), black)`
                }}
                onMouseDown={(e) => {
                  setIsDraggingSat(true)
                  const rect = e.currentTarget.getBoundingClientRect()
                  const y = e.clientY - rect.top
                  const newLightness = Math.round(50 - (y / rect.height) * 50)
                  updateColor(hue, saturation, newLightness)
                }}
              >
                <div 
                  className="absolute w-full h-1 border-2 border-white shadow-lg"
                  style={{
                    top: `${Math.max(0, Math.min(100, ((50 - lightness) / 50) * 100))}%`,
                    transform: 'translateY(-50%)'
                  }}
                />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div 
                className="w-full h-16 rounded-t border border-gray-700 relative overflow-hidden" 
                style={{ 
                  backgroundImage: `url(/checkerboard.png)`,
                  backgroundSize: '32px 32px'
                }} 
              >
                <div 
                  className="absolute inset-0"
                  style={{ backgroundColor: `rgba(${hexToRGB(originalColorRef.current || (typeof color === 'string' ? color : color.hex)).r}, ${hexToRGB(originalColorRef.current || (typeof color === 'string' ? color : color.hex)).g}, ${hexToRGB(originalColorRef.current || (typeof color === 'string' ? color : color.hex)).b}, ${originalAlphaRef.current / 255})` }}
                />
              </div>
              <div 
                className="w-full h-16 rounded-b border border-gray-700 border-t-0 relative overflow-hidden" 
                style={{ 
                  backgroundImage: `url(/checkerboard.png)`,
                  backgroundSize: '32px 32px'
                }} 
              >
                <div 
                  className="absolute inset-0"
                  style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha / 255})` }}
                />
              </div>
              <div className="text-xs text-gray-400 text-center flex justify-around">
                <div>Current</div>
                <div>New</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setColorMode('HSL')}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                colorMode === 'HSL'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              HSL
            </button>
            <button
              onClick={() => setColorMode('RGB')}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                colorMode === 'RGB'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              RGB
            </button>
          </div>

          {colorMode === 'HSL' && (
            <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hue: {hue}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => updateColor(parseInt(e.target.value), saturation, lightness)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), 
                    hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), 
                    hsl(360, 100%, 50%))`
                }}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Saturation: {saturation}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={(e) => updateColor(hue, parseInt(e.target.value), lightness)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`
                }}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Lightness: {lightness}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={(e) => updateColor(hue, saturation, parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`
                }}
              />
            </div>
            </div>
          )}

          {colorMode === 'RGB' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Red: {rgb.r}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRGBChange('r', e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))`
                  }}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Green: {rgb.g}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRGBChange('g', e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))`
                  }}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Blue: {rgb.b}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRGBChange('b', e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))`
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Opacity: {Math.round((alpha / 255) * 100)}%</label>
            <input
              type="range"
              min="0"
              max="255"
              value={alpha}
              onChange={(e) => {
                const newAlpha = parseInt(e.target.value)
                setAlpha(newAlpha)
                onChange({ hex, r: rgb.r, g: rgb.g, b: rgb.b, a: newAlpha, h: hue, s: saturation, l: lightness })
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0), 
                  rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1))`
              }}
            />
          </div>

          <div className="mt-3">
            <Input
              label="Hex"
              value={hex + (alpha < 255 ? alpha.toString(16).padStart(2, '0').toUpperCase() : '')}
              onChange={handleHexChange}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-4 gap-3 mt-3">
            <Input
              label="R"
              type="number"
              min="0"
              max="255"
              value={rgb.r}
              onChange={(e) => handleRGBChange('r', e.target.value)}
              className="text-sm"
            />
            <Input
              label="G"
              type="number"
              min="0"
              max="255"
              value={rgb.g}
              onChange={(e) => handleRGBChange('g', e.target.value)}
              className="text-sm"
            />
            <Input
              label="B"
              type="number"
              min="0"
              max="255"
              value={rgb.b}
              onChange={(e) => handleRGBChange('b', e.target.value)}
              className="text-sm"
            />
            <Input
              label="A"
              type="number"
              min="0"
              max="255"
              value={alpha}
              onChange={(e) => {
                const newAlpha = parseInt(e.target.value) || 0
                setAlpha(Math.max(0, Math.min(255, newAlpha)))
                onChange({ hex, r: rgb.r, g: rgb.g, b: rgb.b, a: Math.max(0, Math.min(255, newAlpha)), h: hue, s: saturation, l: lightness })
              }}
              className="text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleOk}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              OK
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorPicker
