import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoan } from '@/context/LoanContext';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  applicationId: string | null;
}

export function ChatInterface({ applicationId }: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const { chatMessages, addChatMessage } = useLoan();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || !applicationId) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInput('');
    setIsThinking(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/loan/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          question: input.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'I apologize, I could not process your question.',
        timestamp: new Date(),
      });
    } catch {
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, there was an error processing your question. Please try again.',
        timestamp: new Date(),
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="gradient"
        size="lg"
        className="fixed bottom-6 right-6 rounded-full h-16 w-16 p-0 shadow-navy z-50 premium-button hover-glow"
        disabled={!applicationId}
        title={applicationId ? "Ask questions about this application" : "Upload a document first to enable chat"}
      >
        <MessageCircle className="h-6 w-6" />
        {applicationId && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary" />
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[520px] glass-card-premium rounded-3xl shadow-navy z-50 flex flex-col overflow-hidden animate-slide-up border border-white/50">
      {/* Header */}
      <div className="gradient-hero p-5 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">AI Assistant</h3>
            <p className="text-xs text-white/60 font-medium">Ask about the application</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="relative z-10 rounded-xl p-2.5 hover:bg-white/10 transition-all duration-300 border border-white/10"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p>Ask any question about the loan application.</p>
            <p className="text-xs mt-2">For example: "Why was this loan rejected?"</p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                message.role === 'user' 
                  ? 'bg-primary/10 text-primary' 
                  : 'gradient-primary text-white'
              )}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className={cn(
                'rounded-2xl px-4 py-2.5 max-w-[75%]',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              )}>
                {message.role === 'assistant' ? (
                  <div 
                    className="text-sm leading-relaxed whitespace-pre-line [&_strong]:font-semibold [&_strong]:text-primary"
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\. /g, '.\n\n')
                    }}
                  />
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        
        {isThinking && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isThinking}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            variant="gradient"
            size="icon"
            className="rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
