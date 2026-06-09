'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Play, Trash2, Loader2 } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete?: (blob: Blob, url: string) => void
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorder.current = recorder
      chunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onRecordingComplete?.(blob, url)
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setRecording(true)
    } catch {
      alert('Microphone access denied. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    mediaRecorder.current?.stop()
    setRecording(false)
  }

  const playAudio = () => {
    if (!audioUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => setPlaying(false)
    }
    audioRef.current.play()
    setPlaying(true)
  }

  const clearAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setPlaying(false)
    audioRef.current = null
  }

  return (
    <div className="flex items-center gap-3">
      {!recording && !audioUrl && (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
        >
          <Mic className="w-4 h-4" />
          Record Voice Note
        </button>
      )}

      {recording && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Recording...</span>
          <button onClick={stopRecording} className="p-1 hover:bg-destructive/20 rounded-lg">
            <Square className="w-4 h-4" />
          </button>
        </div>
      )}

      {audioUrl && !recording && (
        <div className="flex items-center gap-2">
          <button
            onClick={playAudio}
            className="p-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            {playing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          </button>
          <span className="text-xs text-muted-foreground">Voice note recorded</span>
          <button onClick={clearAudio} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
