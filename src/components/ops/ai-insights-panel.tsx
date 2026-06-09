'use client'

import { useAppStore } from '@/store/use-store'
import { Brain, Tag, AlertTriangle, BarChart3, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { riskFlagLabels, tagLabels } from '@/lib/ai-engine'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function AiInsightsPanel({ requestId }: { requestId: string }) {
  const analysis = useAppStore((s) => s.aiAnalyses[requestId])
  const recommendation = useAppStore((s) => s.aiRecommendations[requestId])
  const loading = useAppStore((s) => s.aiLoading)
  const runAnalysis = useAppStore((s) => s.runAiAnalysis)
  const runMatching = useAppStore((s) => s.runAiMatching)
  const partners = useAppStore((s) => s.supportPartners)
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!analysis) runAnalysis(requestId)
    if (!recommendation) runMatching(requestId)
  }, [requestId])

  if (loading && !analysis) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-blue" />
          <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing request...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-blue" />
        <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
        <span className="text-[10px] bg-blue/10 text-blue px-2 py-0.5 rounded-full ml-auto">
          Mock AI
        </span>
      </div>

      {analysis && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-md"
                >
                  {tagLabels[tag] || tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Classification</span>
            </div>
            <span className="text-xs bg-blue/10 text-blue px-2 py-1 rounded-md font-medium">
              {analysis.classification === 'hospital' ? '🏥 Hospital Visit' :
               analysis.classification === 'government' ? '🏛️ Government Office' :
               analysis.classification === 'interview' ? '💼 Interview' :
               analysis.classification === 'elderly' ? '👴 Elderly Support' :
               analysis.classification === 'event' ? '🎉 Event & Social' : '📋 Other'}
            </span>
          </div>

          {analysis.riskFlags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk Flags</span>
              </div>
              <div className="space-y-1.5">
                {analysis.riskFlags.map((flag) => {
                  const config = riskFlagLabels[flag]
                  return (
                    <div
                      key={flag}
                      className={`text-[11px] px-2.5 py-1.5 rounded-md border ${config.color} flex items-center gap-1.5`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {recommendation && (
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Brain className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Match Recommendation</span>
              </div>

              {recommendation.recommended && recommendation.recommended.partnerId && (
                <div className="bg-blue/5 rounded-lg p-3 border border-blue/10 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">Recommended</span>
                    <span className="text-xs font-bold text-blue">
                      {recommendation.recommended.score}%
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {partners.find((p) => p.id === recommendation.recommended.partnerId)?.name || 'Unknown'}
                  </p>
                  <div className="mt-1.5 space-y-0.5">
                    {recommendation.recommended.reasons.map((r, i) => (
                      <p key={i} className="text-[10px] text-muted-foreground">{r}</p>
                    ))}
                  </div>
                </div>
              )}

              {recommendation.alternatives.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground/60 mb-1.5">Alternatives</p>
                  {recommendation.alternatives.map((alt) => {
                    const partner = partners.find((p) => p.id === alt.partnerId)
                    return (
                      <div key={alt.partnerId} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <span className="text-xs text-foreground/80">{partner?.name || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{alt.score}%</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-muted-foreground/30 rounded-full"
                              style={{ width: `${alt.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {recommendation.confidence > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Confidence</span>
                  <span className="text-xs font-medium text-foreground">{recommendation.confidence}%</span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground/60 mb-2">Was this recommendation helpful?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAiFeedback('helpful')
                      toast.success('Thanks for your feedback!')
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      aiFeedback === 'helpful' ? 'bg-green/10 text-green' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                  </button>
                  <button
                    onClick={() => {
                      setAiFeedback('not-helpful')
                      toast.success('Feedback recorded. We\'ll improve!')
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      aiFeedback === 'not-helpful' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Not Helpful
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
