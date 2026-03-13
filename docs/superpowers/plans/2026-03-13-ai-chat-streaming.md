# AI Chat Streaming Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake `setTimeout` stub in the Zustand store with a real streaming AI response via OpenRouter (Claude Haiku 3.5) using the Vercel AI SDK `useChat` hook.

**Architecture:** A new `POST /api/chat` route calls OpenRouter via `@ai-sdk/openai` and returns a streaming response. The `useChat` hook in `page.tsx` owns `messages` and `status`; these are passed as props to `ChatWindow` and `Sidebar`. Zustand keeps all other state (auth, sidebar, history, loginModal) unchanged.

**Tech Stack:** Next.js 16 App Router, Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`), Zustand v5, TypeScript, pnpm, Biome

**Spec:** `docs/superpowers/specs/2026-03-13-ai-chat-streaming-design.md`

---

## Chunk 1: Install dependencies + create the API route

### Task 1: Install Vercel AI SDK packages

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install packages**

```bash
pnpm add ai @ai-sdk/openai @ai-sdk/react
```

Expected: all three packages added to `dependencies` in `package.json`, `pnpm-lock.yaml` updated.

- [ ] **Step 2: Verify install**

```bash
pnpm list ai @ai-sdk/openai @ai-sdk/react
```

Expected: all three packages listed at their installed versions.

---

### Task 2: Create the `/api/chat` streaming route

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p src/app/api/chat
```

- [ ] **Step 2: Write the route**

Create `src/app/api/chat/route.ts`:

```ts
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import type { NextRequest } from "next/server";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_KEY,
});

const SYSTEM_PROMPT = `You are Huisly, a conversational housing agent for the Netherlands.
Help users find rental housing. Ask about city, budget, move date, and preferences.
Keep responses concise and warm. Respond in plain text only (no markdown).`;

export async function POST(req: NextRequest) {
  if (!process.env.OPEN_ROUTER_KEY) {
    return new Response("OPEN_ROUTER_KEY is not set", { status: 500 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: openrouter("anthropic/claude-haiku-3-5"),
    system: SYSTEM_PROMPT,
    messages,
  });

  return result.toDataStreamResponse();
}
```

- [ ] **Step 3: Run the dev server and manually test the route**

```bash
pnpm dev
```

In a separate terminal:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

Expected: streaming SSE response with tokens arriving, starting with `0:"` (Vercel AI SDK data stream format). You should see text tokens appear. If you get `OPEN_ROUTER_KEY is not set`, the env var is missing from `.env.local` or `.env`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/route.ts package.json pnpm-lock.yaml
git commit -m "feat(api): add streaming chat route via OpenRouter"
```

---

## Chunk 2: Update types and Zustand store

### Task 3: Update `MessageBubble.tsx` to use SDK `Message` type

**Files:**
- Modify: `src/components/chat/MessageBubble.tsx`

The local `Message` type has `id`, `role`, `content`, and `listings?`. The SDK's `Message` type (from `'ai'`) also has `id`, `role`, `content`. We extend it locally to preserve `listings`.

- [ ] **Step 1: Replace the local `Message` type**

In `src/components/chat/MessageBubble.tsx`, replace the existing `Message` interface:

```ts
// Remove this:
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  listings?: Listing[];
}

// Add this:
import type { Message as AIMessage } from "ai";

export type Message = AIMessage & {
  listings?: Listing[];
};
```

The full updated top of the file:

```ts
import type { Message as AIMessage } from "ai";
import { ListingCard } from "@/components/ui/ListingCard";

export interface Listing {
  id: string;
  price: string;
  title: string;
  meta: string;
  source: string;
}

export type Message = AIMessage & {
  listings?: Listing[];
};
```

Rest of the file is unchanged.

- [ ] **Step 2: Check for TypeScript errors**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors. If the compiler complains about `role` type narrowing (SDK uses `'user' | 'assistant' | 'system' | 'tool'` while the JSX checks `message.role === "user"`), the check still works correctly since it's a string comparison — no fix needed.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/MessageBubble.tsx
git commit -m "refactor(chat): extend SDK Message type in MessageBubble"
```

---

### Task 4: Clean up Zustand store

**Files:**
- Modify: `src/lib/store.ts`

Remove `messages`, `isLoading`, `addMessage`, `setMessages`, `setLoading`, `sendMessage`, `newChat` from the store. Keep everything else.

- [ ] **Step 1: Remove the message-related state and actions**

Replace the full contents of `src/lib/store.ts` with:

```ts
import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface ChatHistoryItem {
  id: string;
  title: string;
  active?: boolean;
}

interface ChatStore {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Chat history
  history: ChatHistoryItem[];
  activeChatId: string | null;
  setActiveChat: (id: string) => void;

  // Current chat context
  title: string;
  matchCount: number | undefined;
  setTitle: (title: string) => void;
  setMatchCount: (count: number | undefined) => void;

  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Login modal
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

const INITIAL_HISTORY: ChatHistoryItem[] = [
  { id: "1", title: "Looking for Amsterdam flat", active: true },
  { id: "2", title: "Utrecht budget search" },
  { id: "3", title: "Den Haag expat housing" },
];

export const useChatStore = create<ChatStore>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  history: INITIAL_HISTORY,
  activeChatId: "1",
  setActiveChat: (id) =>
    set((state) => ({
      activeChatId: id,
      sidebarOpen: false,
      history: state.history.map((item) => ({
        ...item,
        active: item.id === id,
      })),
    })),

  title: "",
  matchCount: undefined,
  setTitle: (title) => set({ title }),
  setMatchCount: (count) => set({ matchCount: count }),

  user: null,
  setUser: (user) => set({ user }),

  loginModalOpen: false,
  setLoginModalOpen: (open) => set({ loginModalOpen: open }),
}));
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
pnpm exec tsc --noEmit
```

Expected: errors pointing to `ChatWindow.tsx` (uses `messages`, `isLoading`, `sendMessage` from store) and `Sidebar.tsx` (uses `newChat` from store). These will be fixed in the next tasks.

- [ ] **Step 3: Commit**

```bash
git add src/lib/store.ts
git commit -m "refactor(store): remove message state — moved to useChat hook"
```

---

## Chunk 3: Update components

### Task 5: Update `ChatWindow.tsx` to accept props

**Files:**
- Modify: `src/components/chat/ChatWindow.tsx`

Replace the store-sourced `messages`/`isLoading`/`sendMessage` with props.

- [ ] **Step 1: Rewrite `ChatWindow.tsx`**

Replace the full contents of `src/components/chat/ChatWindow.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/components/chat/MessageBubble";
import { useChatStore } from "@/lib/store";
import { InputBar } from "./InputBar";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  status: "submitted" | "streaming" | "ready" | "error";
  append: (msg: { role: "user"; content: string }) => void;
}

export function ChatWindow({ messages, status, append }: ChatWindowProps) {
  const { toggleSidebar, user, setLoginModalOpen } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const messageCount = messages.length;
  const isEmpty = messageCount === 0;
  const isLoading = status === "submitted";

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount]);

  function handleSend(content: string) {
    append({ role: "user", content });
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
      {/* Top bar — glass effect */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 z-10"
        style={{
          background: "rgba(15,15,16,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Left: sidebar toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors flex-shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Center: spacer */}
        <div className="flex-1" />

        {/* Right: sign in or avatar */}
        {!user ? (
          <button
            type="button"
            onClick={() => setLoginModalOpen(true)}
            className="h-9 px-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-semibold transition-colors flex-shrink-0"
          >
            Sign in
          </button>
        ) : null}
      </div>

      {isEmpty ? (
        /* Empty state — input centered */
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16 gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-[26px] font-semibold text-[var(--text-primary)] tracking-tight">
              Where would you like to live?
            </h1>
            <p className="text-[15px] text-[var(--text-muted)]">
              Tell me your city, budget, and move-in date.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <InputBar
              onSend={handleSend}
              placeholder="e.g. Amsterdam, 2-bed, under €1,400, from April"
              inline
            />
          </div>
        </div>
      ) : (
        <>
          {/* Messages — extends behind floating input */}
          <div className="flex-1 overflow-y-auto py-6 md:py-10 pb-36">
            <div className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isLoading && (
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input — floating over content */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <InputBar onSend={handleSend} disabled={status === "submitted" || status === "streaming"} />
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Check TypeScript**

```bash
pnpm exec tsc --noEmit
```

Expected: `ChatWindow` errors resolved. Remaining error will be `Sidebar.tsx` (still uses `newChat`).

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/ChatWindow.tsx
git commit -m "refactor(chat): ChatWindow accepts useChat props instead of Zustand"
```

---

### Task 6: Update `Sidebar.tsx` to accept `onNewChat` prop

**Files:**
- Modify: `src/components/chat/Sidebar.tsx`

Remove `newChat` from the store import. Accept `onNewChat` as a prop instead.

- [ ] **Step 1: Update `Sidebar.tsx`**

Change line 18 — remove `newChat` from the destructured store values:

```ts
// Before:
const { history, setActiveChat, newChat, user } = useChatStore();

// After:
const { history, setActiveChat, user } = useChatStore();
```

Add `onNewChat` to the component props:

```ts
// Before:
export function Sidebar() {

// After:
interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
```

Update the New Chat button's `onClick`:

```tsx
// Before:
onClick={newChat}

// After:
onClick={onNewChat}
```

- [ ] **Step 2: Check TypeScript**

```bash
pnpm exec tsc --noEmit
```

Expected: `Sidebar.tsx` error resolved. The remaining error will be in `chat/page.tsx` — it renders `<Sidebar />` without the now-required `onNewChat` prop.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/Sidebar.tsx
git commit -m "refactor(sidebar): accept onNewChat prop instead of calling store"
```

---

### Task 7: Wire everything together in `page.tsx`

**Files:**
- Modify: `src/app/chat/page.tsx`

Initialize `useChat` here. Pass `messages`/`status`/`append` to `ChatWindow`. Pass `onNewChat` to `Sidebar`.

- [ ] **Step 1: Rewrite `page.tsx`**

Replace the full contents of `src/app/chat/page.tsx`:

```tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { LoginModal } from "@/components/auth/LoginModal";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Sidebar } from "@/components/chat/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useChatStore } from "@/lib/store";

export default function ChatPage() {
  useAuth();
  const { sidebarOpen, setSidebarOpen, loginModalOpen, setLoginModalOpen } =
    useChatStore();

  const { messages, status, append, setMessages } = useChat({
    api: "/api/chat",
  });

  function handleNewChat() {
    setMessages([]);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg-base)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/50 md:hidden w-full cursor-default"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 md:relative md:block
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar onNewChat={handleNewChat} />
      </div>

      <ChatWindow
        messages={messages}
        status={status}
        append={append}
      />

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Check TypeScript — expect clean**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run the linter**

```bash
pnpm lint
```

Fix any Biome warnings before committing.

- [ ] **Step 4: Commit**

```bash
git add src/app/chat/page.tsx
git commit -m "feat(chat): wire useChat hook — streaming AI responses live"
```

---

## Chunk 4: Manual verification

### Task 8: End-to-end smoke test

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Open the app**

Navigate to `http://localhost:3000/chat`.

- [ ] **Step 3: Send a message**

Type: `I'm looking for a 2-bed in Amsterdam under €1,400`

Expected:
- Message appears immediately in the chat
- Bounce indicator shows briefly (`status === 'submitted'`)
- AI response streams in token-by-token
- Input is disabled while response is streaming
- Input re-enables after response completes

- [ ] **Step 4: Test New Chat**

Click "New chat" in the sidebar.

Expected: messages clear, empty state reappears ("Where would you like to live?").

- [ ] **Step 5: Test error case (optional)**

Temporarily set `OPEN_ROUTER_KEY=invalid` in `.env`, restart dev server, send a message.

Expected: graceful error (the `useChat` hook will set `status === 'error'`; the UI doesn't crash).

Restore the correct key when done.

- [ ] **Step 6: Final commit if any fixups were made**

```bash
git add -A
git commit -m "fix(chat): post-smoke-test fixups"
```
