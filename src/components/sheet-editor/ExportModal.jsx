import { useState, useEffect } from 'react'
import Slider from '../forms/Slider'

function ExportModal({ onClose, image, rows, columns, selectedFrames, padding }) {
  const pad = padding || { top: 0, right: 0, bottom: 0, left: 0 }
  const selectedFrameIndices = Object.entries(selectedFrames)
    .filter(([_, isSelected]) => isSelected)
    .map(([index]) => parseInt(index))
  
  const totalFrames = selectedFrameIndices.length
  const [framesPerRow, setFramesPerRow] = useState(Math.min(4, totalFrames))
  const calculatedRows = Math.ceil(totalFrames / framesPerRow)
  const framesInLastRow = totalFrames % framesPerRow || framesPerRow
  const emptyFramesInLastRow = framesPerRow - framesInLastRow
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  // Load image to get dimensions
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
    }
    img.src = image
  }, [image])

  const frameWidth = Math.floor((imageDimensions.width - pad.left - pad.right) / columns)
  const frameHeight = Math.floor((imageDimensions.height - pad.top - pad.bottom) / rows)
  const finalWidth = frameWidth * framesPerRow
  const finalHeight = frameHeight * calculatedRows

  const handleExport = () => {
    if (selectedFrameIndices.length === 0) return

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = frameWidth * framesPerRow
      canvas.height = frameHeight * calculatedRows
      const ctx = canvas.getContext('2d')

      selectedFrameIndices.forEach((frameIndex, i) => {
        const sourceCol = frameIndex % columns
        const sourceRow = Math.floor(frameIndex / columns)
        const destCol = i % framesPerRow
        const destRow = Math.floor(i / framesPerRow)

        ctx.drawImage(
          img,
          pad.left + sourceCol * frameWidth,
          pad.top + sourceRow * frameHeight,
          frameWidth,
          frameHeight,
          destCol * frameWidth,
          destRow * frameHeight,
          frameWidth,
          frameHeight
        )
      })

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sprite-sheet-${framesPerRow}x${calculatedRows}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    img.src = image
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">Export Sprite Sheet</h3>
        
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Total Frames to Export</div>
            <div className="text-2xl font-bold text-white">{totalFrames}</div>
          </div>

          <div>
            <Slider
              label="Frames Per Row"
              min={1}
              max={totalFrames}
              value={framesPerRow}
              onChange={(e) => setFramesPerRow(parseInt(e.target.value))}
            />
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Calculated Rows</div>
            <div className="text-2xl font-bold text-white">{calculatedRows}</div>
            {emptyFramesInLastRow > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                {emptyFramesInLastRow} empty frame{emptyFramesInLastRow !== 1 ? 's' : ''} in last row
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-700">
            <div className="text-sm text-purple-300 mb-1">Final Image Resolution</div>
            <div className="text-2xl font-bold text-white">
              {finalWidth} × {finalHeight}
            </div>
            <div className="text-xs text-purple-400 mt-1">
              {frameWidth}×{frameHeight} per frame
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors text-white"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
