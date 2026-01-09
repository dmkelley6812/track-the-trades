import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Plus, Loader2, MessageSquare } from 'lucide-react';
import MessageBubble from '@/components/insights/MessageBubble';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AGENT_NAME = 'trading_insights';

const STARTER_QUESTIONS = [
  "Which tickers have been most profitable for me?",
  "What time of day do I trade best?",
  "Are there any patterns in my losing trades?",
  "How does my mood affect my trading performance?",
  "What's my win rate by day of the week?",
];

export default function InsightsPage() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations', AGENT_NAME],
    queryFn: () => base44.agents.listConversations({ agent_name: AGENT_NAME }),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsubscribe();
    }
  }, [conversationId]);

  const loadConversation = async (convId) => {
    const conv = await base44.agents.getConversation(convId);
    setConversationId(convId);
    setMessages(conv.messages || []);
  };

  const createNewConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: {
        name: 'Trading Insights Chat',
        created_at: new Date().toISOString(),
      }
    });
    setConversationId(conv.id);
    setMessages([]);
    queryClient.invalidateQueries({ queryKey: ['conversations', AGENT_NAME] });
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !conversationId) return;

    setIsSending(true);
    setInput('');

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: text,
      });
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleStarterQuestion = (question) => {
    if (!conversationId) {
      createNewConversation().then(() => {
        setTimeout(() => sendMessage(question), 500);
      });
    } else {
      sendMessage(question);
    }
  };

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center h-screen bg-[rgb(var(--bg))]">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[rgb(var(--bg))]">
      {/* Sidebar - Conversation History */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <Button
            onClick={createNewConversation}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg mb-1 transition-colors text-sm",
                  conversationId === conv.id
                    ? "bg-[rgb(var(--primary)/0.2)] text-[rgb(var(--primary))] border border-[rgb(var(--primary-border))]"
                    : "text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--hover-bg))] hover:text-[rgb(var(--text))]"
                )}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="truncate">
                    {conv.metadata?.name || 'Trading Insights Chat'}
                  </span>
                </div>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                  {new Date(conv.created_date).toLocaleDateString()}
                </p>
              </button>
            ))
          ) : (
            <p className="text-sm text-[rgb(var(--text-muted))] text-center mt-8">
              No conversations yet
            </p>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary))] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[rgb(var(--text))]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[rgb(var(--text))]">Trading Insights AI</h1>
              <p className="text-sm text-[rgb(var(--text-muted))]">Ask me anything about your trading performance</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!conversationId ? (
            <div className="max-w-2xl mx-auto mt-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary))] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[rgb(var(--text))]" />
                </div>
                <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">Welcome to Trading Insights</h2>
                <p className="text-[rgb(var(--text-muted))]">
                  I can analyze your complete trading history and journal entries to provide personalized insights
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide">Suggested Questions</p>
                {STARTER_QUESTIONS.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStarterQuestion(question)}
                    className="w-full text-left p-4 rounded-xl bg-slate-800/30 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all text-slate-200 text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="text-center mt-12">
                  <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--bg-card))] flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-[rgb(var(--text-muted))]" />
                  </div>
                  <p className="text-[rgb(var(--text-muted))]">Ask me anything about your trading performance</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={conversationId ? "Ask about your trading performance..." : "Create a new chat to start"}
              disabled={!conversationId || isSending}
              className="flex-1 min-h-[60px] max-h-[200px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            />
            <Button
              type="submit"
              disabled={!conversationId || !input.trim() || isSending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-[60px] px-6"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-[rgb(var(--text-muted))] text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}