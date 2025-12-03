'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Play, RotateCcw, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

const sampleCommands = [
  'adaptrix --help',
  'adaptrix search coding',
  'adaptrix install TechCorp-AI/Code-Enhancer-Lora',
  'adaptrix list --installed',
  'adaptrix run --model llama-3.1 --adapter Code-Enhancer-Lora'
]

export function CLIDemo() {
  const [selectedCommand, setSelectedCommand] = useState(sampleCommands[0])
  const [commandOutput, setCommandOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [commandOutput])

  const runCommand = async () => {
    if (!selectedCommand.trim()) return

    setIsRunning(true)
    setCommandOutput(prev => prev + `$ ${selectedCommand}\n`)
    
    try {
      const response = await fetch('/api/cli/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: selectedCommand }),
      })

      const data = await response.json()
      
      if (data.success) {

        const lines = data.output.split('\n')
        let currentOutput = ''
        
        for (let i = 0; i < lines.length; i++) {
          currentOutput += lines[i] + '\n'
          setCommandOutput(prev => prev + lines[i] + '\n')
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        
        setCommandHistory(prev => [...prev, selectedCommand])
      } else {
        setCommandOutput(prev => prev + `Error: ${data.error}\n`)
      }
    } catch (error) {
      setCommandOutput(prev => prev + `Error: Failed to execute command\n`)
    } finally {
      setIsRunning(false)
      setCommandOutput(prev => prev + '\n')
    }
  }

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(selectedCommand)
      setCopiedCommand(selectedCommand)
      toast({
        title: "Command copied!",
        description: "Command copied to clipboard",
      })
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the command manually",
        variant: "destructive"
      })
    }
  }

  const clearTerminal = () => {
    setCommandOutput('')
    setCommandHistory([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRunning) {
      runCommand()
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Adaptrix CLI Demo
            </CardTitle>
            <CardDescription>
              Try out the Adaptrix command-line interface
            </CardDescription>
          </div>
          <Badge variant="secondary">Interactive Demo</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Command Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Select value={selectedCommand} onValueChange={setSelectedCommand}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select a command..." />
              </SelectTrigger>
              <SelectContent>
                {sampleCommands.map((cmd) => (
                  <SelectItem key={cmd} value={cmd} className="font-mono text-sm">
                    {cmd}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={runCommand}
            disabled={isRunning || !selectedCommand.trim()}
            size="sm"
          >
            {isRunning ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run
          </Button>
          <Button
            onClick={handleCopyCommand}
            variant="outline"
            size="sm"
          >
            {copiedCommand === selectedCommand ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={clearTerminal}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Terminal Output */}
        <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[400px] max-h-[600px] overflow-y-auto">
          <div 
            ref={outputRef}
            className="whitespace-pre-wrap"
            style={{ minHeight: '360px' }}
          >
            {commandOutput || (
              <div className="text-slate-500">
                Welcome to Adaptrix CLI Demo!
                Select a command above and press Run to see it in action.
                
                Available commands:
                • adaptrix --help - Show help information
                • adaptrix search coding - Search for coding adapters
                • adaptrix install TechCorp-AI/Code-Enhancer-Lora - Install an adapter
                • adaptrix list --installed - List installed adapters
                • adaptrix run --model llama-3.1 --adapter Code-Enhancer-Lora - Run with adapter
              </div>
            )}
            {isRunning && (
              <div className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Quick examples:</span>
          {sampleCommands.slice(0, 3).map((cmd) => (
            <Button
              key={cmd}
              variant="outline"
              size="sm"
              onClick={() => setSelectedCommand(cmd)}
              className="font-mono text-xs"
            >
              {cmd}
            </Button>
          ))}
        </div>

        {/* Installation Instructions */}
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Installation</h4>
          <code className="text-sm bg-slate-200 dark:bg-slate-700 p-2 rounded block">
            npm install -g adaptrix-cli
          </code>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Install the CLI tool globally to use Adaptrix adapters with your local LLM models.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}