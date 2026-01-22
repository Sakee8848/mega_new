"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Search, Inbox, FileText, ShieldAlert, User, Sparkles, Send,
  CheckCircle2, Calculator, Settings, Plus, LayoutGrid, Sun, Moon,
  RefreshCw, Clock, Briefcase, Calendar, X, Paperclip
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
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
} from "@/components/ui/command"

// --- 模拟数据库 (增强版：包含保险专用字段) ---
const MOCK_EMAILS = [
  {
    id: 1,
    sender: "Alice Smith",
    email: "alice@logisticscorp.com",
    subject: "Re: Quote Request for Logistics Corp",
    preview: "Hi, could you please provide a CGL quote for our new warehouse...",
    time: "10:23 AM",
    intent: "quote",
    tags: ["Urgent"],
    read: false,
    drafts: {
      professional: "Hi Alice, received. I will work on the CGL quote for the CA location immediately. Based on the $5M revenue, I'll approach Travelers and Liberty Mutual first to get the best rates. Expect an update by Thursday afternoon.",
      empathetic: "Hi Alice, thanks for reaching out! I completely understand the urgency for the new CA warehouse coverage. I'm prioritizing this request to ensure you have peace of mind. I'll get back to you with the best options by Thursday.",
      direct: "Received. Working on CGL quote for CA location. Targeting Travelers/Liberty Mutual. Update by Thursday."
    },
    // Mirror Index 数据 (增强版)
    meta: {
      policyNo: "Pending",
      effectiveDate: "2026-02-01",
      premium: "Est. $45k - $50k",
      location: "CA, 90001",
      revenue: "$5,000,000"
    }
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
    drafts: {
      professional: "Thank you for the renewal notice. We will review the terms and discuss with the insured.",
      empathetic: "Thanks for sending this over. We appreciate your continued partnership. We'll review and get back to you.",
      direct: "Received renewal #992831. Reviewing now."
    },
    meta: {
      policyNo: "992831-GL",
      effectiveDate: "2026-01-15",
      premium: "$12,400",
      location: "HQ - NY",
      revenue: "N/A"
    }
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
    drafts: {
      professional: "John, I'm sorry to hear about the accident. Please send the police report and photos so we can file the claim immediately.",
      empathetic: "John, I am so sorry to hear this. I hope the driver is safe. Please don't worry about the paperwork right now, just send me whatever you have when you can.",
      direct: "Please provide: 1. Police Report 2. Photos 3. Driver Statement. Will file immediately upon receipt."
    },
    meta: {
      policyNo: "992831-Auto",
      effectiveDate: "Active",
      premium: "N/A",
      location: "I-95 M.M 42",
      revenue: "N/A"
    }
  }
]

export default function MegaDashboard() {
  const [open, setOpen] = React.useState(false) // Cmd+K
  const { setTheme, theme } = useTheme()

  // 核心状态
  const [filter, setFilter] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("") // 搜索框状态
  const [selectedMailId, setSelectedMailId] = React.useState(1)
  const [isTaskSheetOpen, setIsTaskSheetOpen] = React.useState(false)
  const [isComposeOpen, setIsComposeOpen] = React.useState(false) // 撰写窗口状态
  const [tone, setTone] = React.useState("professional")

  // AI 状态
  const [aiText, setAiText] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)

  const currentMail = MOCK_EMAILS.find(m => m.id === selectedMailId) || MOCK_EMAILS[0]

  // --- 智能过滤逻辑 (Search + Intent) ---
  const filteredEmails = MOCK_EMAILS.filter((mail) => {
    // 1. 先按左侧导航过滤
    const matchesIntent = filter === "all" ? true : mail.intent === filter
    // 2. 再按顶部搜索框过滤 (模糊搜索 发件人 或 主题)
    const matchesSearch = searchQuery === ""
      ? true
      : mail.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mail.subject.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesIntent && matchesSearch
  })

  // 切换邮件时重置
  React.useEffect(() => {
    setAiText("")
    setIsTyping(false)
    setTone("professional")
  }, [selectedMailId])

  const runTypingEffect = (selectedTone?: string) => {
    const targetTone = selectedTone || tone;
    // @ts-ignore
    const targetText = currentMail.drafts[targetTone];
    setIsTyping(true)
    setAiText("")
    let index = 0
    const intervalId = setInterval(() => {
      setAiText((prev) => prev + targetText.charAt(index))
      index++
      if (index === targetText.length) {
        clearInterval(intervalId)
        setIsTyping(false)
      }
    }, 20)
  }

  // Cmd+K 监听
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

      {/* --- Dialog: Compose Email (撰写新邮件) --- */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">To</Label>
              <Input placeholder="Recipient" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Subject</Label>
              <Input placeholder="Subject" className="col-span-3" />
            </div>
            <div className="grid gap-2">
              <Textarea placeholder="Type your message here..." className="min-h-[200px]" />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsComposeOpen(false)}><Send className="mr-2 h-4 w-4" /> Send</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Sheet: Task Creation --- */}
      <Sheet open={isTaskSheetOpen} onOpenChange={setIsTaskSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Task</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Task Title</Label>
              <Input value={`Follow up: ${currentMail.subject}`} />
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Input type="date" />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <div className="flex gap-2">
                <Badge variant="destructive" className="cursor-pointer">High</Badge>
                <Badge variant="outline" className="cursor-pointer">Medium</Badge>
              </div>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button onClick={() => setIsTaskSheetOpen(false)}>Save to Board</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* --- Command Palette --- */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => { setFilter('all'); setOpen(false) }}><Inbox className="mr-2 h-4 w-4" /> Inbox</CommandItem>
            <CommandItem onSelect={() => { setFilter('quote'); setOpen(false) }}><FileText className="mr-2 h-4 w-4" /> Quotes</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { setIsComposeOpen(true); setOpen(false) }}><Plus className="mr-2 h-4 w-4" /> Compose New Email</CommandItem>
            <CommandItem onSelect={() => { setTheme(theme === "dark" ? "light" : "dark"); setOpen(false) }}><Moon className="mr-2 h-4 w-4" /> Toggle Dark Mode</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Header (连通搜索框) */}
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 shrink-0 backdrop-blur-sm">
        <div className="font-bold text-lg flex items-center gap-2">
          ⚡ MEGA <span className="text-xs font-normal text-muted-foreground border px-1 rounded">V3.7 Final</span>
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            {/* 真正的搜索输入框 */}
            <Input
              type="search"
              placeholder="Search sender, subject, or intent..."
              className="w-full bg-background pl-8 md:w-2/3 lg:w-1/3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-2.5 hidden lg:flex">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">⌘</span>K</kbd>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="ml-auto">
          <User className="mr-2 h-4 w-4" /> Tony Yu
        </Button>
      </header>

      {/* Main Layout */}
      <div className="grid flex-1 grid-cols-[250px_400px_1fr] overflow-hidden">

        {/* Pane 1: Navigation */}
        <nav className="border-r bg-muted/20 flex flex-col gap-2 p-4">
          <div className="px-2 py-2">
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Intents</h2>
            <div className="space-y-1">
              <Button variant={filter === "all" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setFilter("all")}>
                <Inbox className="mr-2 h-4 w-4" /> Inbox <Badge className="ml-auto bg-foreground text-background">{MOCK_EMAILS.length}</Badge>
              </Button>
              <Button variant={filter === "quote" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setFilter("quote")}>
                <FileText className="mr-2 h-4 w-4" /> Quotes
              </Button>
              <Button variant={filter === "claim" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setFilter("claim")}>
                <ShieldAlert className="mr-2 h-4 w-4" /> Claims
              </Button>
            </div>
          </div>
        </nav>

        {/* Pane 2: Email List (带 Compose 按钮) */}
        <div className="flex flex-col border-r min-w-0">
          <div className="p-4 border-b shrink-0 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{filter === 'all' ? 'Inbox' : filter === 'quote' ? 'Quotes' : 'Claims'}</h1>
              <p className="text-sm text-muted-foreground">{filteredEmails.length} messages found</p>
            </div>
            {/* 激活 Compose 按钮 */}
            <Button size="icon" variant="ghost" onClick={() => setIsComposeOpen(true)}><Plus className="h-4 w-4" /></Button>
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
                      <div className="line-clamp-2 text-xs text-muted-foreground">{mail.preview}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {mail.intent === 'quote' && <Badge variant="outline" className="text-blue-600 border-blue-200">Quote</Badge>}
                        {mail.intent === 'claim' && <Badge variant="destructive" className="text-red-600 border-red-200">Claim</Badge>}
                        {mail.intent === 'renewal' && <Badge variant="secondary">Renewal</Badge>}
                        {mail.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                      </div>
                    </button>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64">
                    <ContextMenuItem inset onSelect={() => setIsTaskSheetOpen(true)}><CheckCircle2 className="mr-2 h-4 w-4" /> Create Task</ContextMenuItem>
                    <ContextMenuItem inset><Clock className="mr-2 h-4 w-4" /> Snooze</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem inset className="text-red-600">Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
              {filteredEmails.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No emails match your search.</div>}
            </div>
          </ScrollArea>
        </div>

        {/* Pane 3: Reading Pane */}
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20 min-w-0">
          <div className="flex items-center p-4 border-b bg-background shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold">{currentMail.sender.charAt(0)}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{currentMail.sender}</div>
                <div className="text-xs text-muted-foreground">To: Tony Yu</div>
              </div>
            </div>
            <div className="ml-auto flex gap-2 shrink-0">
              <Button size="sm" onClick={() => runTypingEffect()} disabled={isTyping} className={isTyping ? "animate-pulse" : ""}>
                {isTyping ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> AI Reply</>}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_300px] h-full overflow-hidden">
            <ScrollArea className="h-full bg-background">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">{currentMail.subject}</h2>
                <div className="text-sm leading-relaxed space-y-4">
                  <p className="whitespace-pre-wrap">{currentMail.preview}</p>
                  <p>Here are the details we discussed...</p>
                </div>
                <Separator className="my-8" />
                {/* AI Draft with Tabs */}
                <div className="rounded-md border border-blue-100 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-900 p-4 transition-all">
                  <Tabs defaultValue="professional" value={tone} onValueChange={setTone} className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">AI Draft</span>
                      </div>
                      <TabsList className="h-7">
                        <TabsTrigger value="professional" className="text-xs h-5 px-2">Professional</TabsTrigger>
                        <TabsTrigger value="empathetic" className="text-xs h-5 px-2">Empathetic</TabsTrigger>
                        <TabsTrigger value="direct" className="text-xs h-5 px-2">Direct</TabsTrigger>
                      </TabsList>
                    </div>
                    <div className="min-h-[80px] mt-3">
                      {aiText ? (
                        <p className="text-sm text-foreground leading-relaxed animate-in fade-in duration-300">
                          {aiText}
                          {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 align-middle animate-pulse" />}
                        </p>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-xs text-muted-foreground italic mb-2">Select a tone and generate response</p>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => runTypingEffect()}>
                            Generate {tone.charAt(0).toUpperCase() + tone.slice(1)} Reply
                          </Button>
                        </div>
                      )}
                    </div>
                  </Tabs>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 dark:text-white" disabled={!aiText || isTyping}><Send className="w-3 h-3 mr-1" /> Send</Button>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Right Sidebar: Insurance Specific Mirror Index */}
            <div className="border-l bg-muted/10 flex flex-col h-full overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Mirror Index</span>
                  </div>

                  {/* Policy Data Card (Insurance Specific) */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex justify-between items-center">
                        Policy Data
                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">Verified</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 grid gap-3">
                      <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Intent</Label>
                        <Badge className="w-fit">{currentMail.intent.toUpperCase()}</Badge>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Policy No.</Label>
                        <Input defaultValue={currentMail.meta.policyNo} className="h-7 text-sm font-mono" />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Effective Date</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <Input defaultValue={currentMail.meta.effectiveDate} className="h-7 text-sm" />
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Premium</Label>
                        <div className="flex items-center gap-2">
                          <Input defaultValue={currentMail.meta.premium} className="h-7 text-sm font-medium text-green-700 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex flex-col gap-2">
                      <Button variant="outline" className="w-full justify-start text-xs h-auto py-2" onClick={() => setIsTaskSheetOpen(true)}>
                        <Briefcase className="mr-2 h-3 w-3" /> Create Task
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-xs h-auto py-2">
                        <Calculator className="mr-2 h-3 w-3" /> Calculate Rater
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