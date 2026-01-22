"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Search, Inbox, FileText, ShieldAlert, User, Sparkles, Send,
  CheckCircle2, Calculator, Settings, Plus, LayoutGrid, Sun, Moon,
  RefreshCw, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

// --- 模拟数据库 (Mock Data) ---
const MOCK_EMAILS = [
  {
    id: 1,
    sender: "Alice Smith",
    email: "alice@logisticscorp.com",
    subject: "Re: Quote Request for Logistics Corp",
    preview: "Hi, could you please provide a CGL quote for our new warehouse...",
    time: "10:23 AM",
    intent: "quote", // 关键字段：用于过滤
    tags: ["Urgent"],
    read: false,
  },
  {
    id: 2,
    sender: "Travelers Insurance",
    email: "renewals@travelers.com",
    subject: "Policy Renewal #992831",
    preview: "Attached is the renewal notice for the upcoming term.",
    time: "Yesterday",
    intent: "renewal",
    tags: [],
    read: true,
  },
  {
    id: 3,
    sender: "John Doe",
    email: "john@trucking.com",
    subject: "Claim Filing: Accident on I-95",
    preview: "Unfortunately one of our drivers was involved in a collision...",
    time: "2 Days ago",
    intent: "claim",
    tags: ["High Risk"],
    read: true,
  }
]

export default function MegaDashboard() {
  // --- 状态管理 ---
  const [open, setOpen] = React.useState(false)
  const { setTheme, theme } = useTheme()

  // 导航过滤器状态：'all' | 'quote' | 'claim'
  const [filter, setFilter] = React.useState("all")
  // 当前选中的邮件 ID
  const [selectedMailId, setSelectedMailId] = React.useState(1)

  // AI 流式打字相关状态
  const [aiText, setAiText] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)

  const fullResponse = "Hi Alice, received. I will work on the CGL quote for the CA location immediately. Based on the $5M revenue, I'll approach Travelers and Liberty Mutual first to get the best rates. Expect an update by Thursday afternoon."

  // 核心功能：过滤邮件
  const filteredEmails = MOCK_EMAILS.filter((mail) => {
    if (filter === "all") return true
    return mail.intent === filter
  })

  // 核心功能：模拟 AI 流式打字
  const runTypingEffect = () => {
    setIsTyping(true)
    setAiText("")
    let index = 0
    const intervalId = setInterval(() => {
      setAiText((prev) => prev + fullResponse.charAt(index))
      index++
      if (index === fullResponse.length) {
        clearInterval(intervalId)
        setIsTyping(false)
      }
    }, 30)
  }

  // 键盘监听：Cmd + K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground transition-colors duration-300">
      {/* --- Command Palette --- */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => { setFilter('all'); setOpen(false) }}>
              <Inbox className="mr-2 h-4 w-4" /> <span>Go to Inbox</span>
            </CommandItem>
            <CommandItem onSelect={() => { setFilter('quote'); setOpen(false) }}>
              <FileText className="mr-2 h-4 w-4" /> <span>Filter Quotes</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => {
              setTheme(theme === "dark" ? "light" : "dark")
              setOpen(false)
            }}>
              <Moon className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Sun className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span>Toggle Dark Mode</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* 顶部 Header */}
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 shrink-0 backdrop-blur-sm">
        <div className="font-bold text-lg flex items-center gap-2">
          ⚡ MEGA <span className="text-xs font-normal text-muted-foreground border px-1 rounded">V3.5 Logic</span>
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              onClick={() => setOpen(true)}
              type="search"
              placeholder="CMD+K to search..."
              className="w-full bg-background pl-8 md:w-2/3 lg:w-1/3 cursor-pointer"
              readOnly
            />
            <div className="absolute right-3 top-2.5 hidden lg:flex">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="ml-auto">
          <User className="mr-2 h-4 w-4" /> Tony Yu
        </Button>
      </header>

      {/* 核心布局：3-Pane */}
      <div className="grid flex-1 grid-cols-[250px_400px_1fr] overflow-hidden">

        {/* Pane 1: 侧边导航 (逻辑已连接) */}
        <nav className="border-r bg-muted/20 flex flex-col gap-2 p-4">
          <div className="px-2 py-2">
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
              Intents (意图识别)
            </h2>
            <div className="space-y-1">
              <Button
                variant={filter === "all" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilter("all")}
              >
                <Inbox className="mr-2 h-4 w-4" /> Inbox
                <Badge className="ml-auto bg-foreground text-background">{MOCK_EMAILS.length}</Badge>
              </Button>
              <Button
                variant={filter === "quote" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilter("quote")}
              >
                <FileText className="mr-2 h-4 w-4" /> Quotes (报價)
              </Button>
              <Button
                variant={filter === "claim" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setFilter("claim")}
              >
                <ShieldAlert className="mr-2 h-4 w-4" /> Claims (理賠)
              </Button>
            </div>
          </div>
        </nav>

        {/* Pane 2: 邮件列表 (动态渲染) */}
        <div className="flex flex-col border-r min-w-0">
          <div className="p-4 border-b shrink-0 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">
                {filter === 'all' ? 'Inbox' : filter === 'quote' ? 'Quotes' : 'Claims'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredEmails.length} messages found
              </p>
            </div>
            <Button size="icon" variant="ghost"><Plus className="h-4 w-4" /></Button>
          </div>
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-4 pt-0 mt-4">
              {filteredEmails.map((mail) => (
                <ContextMenu key={mail.id}>
                  <ContextMenuTrigger>
                    <button
                      onClick={() => setSelectedMailId(mail.id)}
                      className={`w-full flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent/80 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedMailId === mail.id ? "bg-accent border-blue-200 dark:border-blue-800" : "bg-card"}`}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{mail.sender}</div>
                            {!mail.read && <span className="flex h-2 w-2 rounded-full bg-blue-600" />}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">{mail.time}</div>
                        </div>
                        <div className="text-xs font-medium">{mail.subject}</div>
                      </div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {mail.preview}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {mail.intent === 'quote' && <Badge variant="outline" className="text-blue-600 border-blue-200">Quote</Badge>}
                        {mail.intent === 'claim' && <Badge variant="destructive" className="text-red-600 border-red-200">Claim</Badge>}
                        {mail.intent === 'renewal' && <Badge variant="secondary">Renewal</Badge>}

                        {mail.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </button>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64">
                    <ContextMenuItem inset>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Create Task
                    </ContextMenuItem>
                    <ContextMenuItem inset>
                      <Clock className="mr-2 h-4 w-4" /> Snooze
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem inset className="text-red-600">Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}

              {filteredEmails.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No emails found in this category.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Pane 3: 阅读与 AI 面板 (保持 V3.4 功能) */}
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20 min-w-0">
          {/* 邮件操作栏 */}
          <div className="flex items-center p-4 border-b bg-background shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold">
                {MOCK_EMAILS.find(m => m.id === selectedMailId)?.sender.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {MOCK_EMAILS.find(m => m.id === selectedMailId)?.sender}
                  &lt;{MOCK_EMAILS.find(m => m.id === selectedMailId)?.email}&gt;
                </div>
                <div className="text-xs text-muted-foreground">To: Tony Yu</div>
              </div>
            </div>
            <div className="ml-auto flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={runTypingEffect}
                disabled={isTyping}
                className={isTyping ? "animate-pulse" : ""}
              >
                {isTyping ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> AI Reply</>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_300px] h-full overflow-hidden">
            {/* 邮件正文区域 */}
            <ScrollArea className="h-full bg-background">
              <div className="p-8">
                {/* 动态显示当前选中邮件的主题 */}
                <h2 className="text-2xl font-bold mb-4">
                  {MOCK_EMAILS.find(m => m.id === selectedMailId)?.subject}
                </h2>

                {/* 这里暂时还是用 Alice 的静态内容演示，实际开发会替换为 dynamic content */}
                <div className="text-sm leading-relaxed space-y-4">
                  <p>Hi Tony,</p>
                  <p>Could you please provide a CGL (Commercial General Liability) quote for our new warehouse location in California?</p>
                  <p>Here are the details:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Address:</strong> 123 Industrial Pkwy, CA 90001</li>
                    <li><strong>Sq Footage:</strong> 50,000 sq ft</li>
                    <li><strong>Projected Revenue:</strong> $5M</li>
                  </ul>
                  <p>We need this by Friday.</p>
                  <p>Thanks,<br />Alice</p>
                </div>

                <Separator className="my-8" />

                {/* AI Draft 区域 */}
                <div className="rounded-md border border-blue-100 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-900 p-4 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                      AI Draft {isTyping && <span className="animate-pulse">...</span>}
                    </span>
                  </div>
                  <div className="min-h-[60px]">
                    {aiText ? (
                      <p className="text-sm text-foreground leading-relaxed animate-in fade-in duration-300">
                        {aiText}
                        {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 align-middle animate-pulse" />}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Click "AI Reply" to generate a response draft based on historical data...
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs" disabled={!aiText || isTyping}>Edit</Button>
                    <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 dark:text-white" disabled={!aiText || isTyping}>
                      <Send className="w-3 h-3 mr-1" /> Send
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* 右侧边栏：Mirror Index */}
            <div className="border-l bg-muted/10 flex flex-col h-full overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Mirror Index</span>
                  </div>
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Extracted Data</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 grid gap-3">
                      <div className="grid gap-1">
                        <span className="text-xs text-muted-foreground">Intent</span>
                        <Badge className="w-fit">Quote Request</Badge>
                      </div>
                      <div className="grid gap-1">
                        <span className="text-xs text-muted-foreground">Location</span>
                        <Input defaultValue="CA, 90001" className="h-7 text-sm" />
                      </div>
                      <div className="grid gap-1">
                        <span className="text-xs text-muted-foreground">Revenue</span>
                        <div className="flex items-center gap-2">
                          <Input defaultValue="$5,000,000" className="h-7 text-sm font-medium text-green-700 dark:text-green-400" />
                          <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Next Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Button variant="outline" className="w-full justify-start text-xs mb-2">
                        + Create Quote in AMS
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}