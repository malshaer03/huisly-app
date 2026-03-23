# AI Chat Streaming — Design Spec

**Date:** 2026-03-13
**Status:** Approved
**Scope:** Wire the chat UI shell to a real streaming AI response via OpenRouter

---

## Problem

The current `sendMessage` in the Zustand store is a fake `setTimeout` stub. The chat UI exists but produces no real AI responses. This spec covers replacing that stub with a live streaming connection to OpenRouter (Claude Haiku 3.5).

---

## Approach

Use the **Vercel AI SDK** (`ai` + `@ai-sdk/openai`) with the `useChat` hook. This is the pattern specified in CLAUDE.md and the most idiomatic fit for Next.js App Router with streaming.

---

## Architecture

```
User types → InputBar → useChat.append()
                              ↓
                    POST /api/chat
                    { messages: [...] }
                              ↓
                    OpenRouter (via @ai-sdk/openai)
                    model: anthropic/claude-haiku-3-5
                    stream: true
                              ↓
                    streamText(...).toDataStreamResponse()
                              ↓
                    useChat receives chunks → updates messages in real time
                              ↓
                    ChatWindow re-renders each token
```

---

## State Ownership

| State | Before | After |
|-------|--------|-------|
| `messages` | Zustand store | `useChat` hook |
| `isLoading` | Zustand store | `useChat` hook |
| `sendMessage` | Zustand store | `useChat.append()` |
| `newChat` | Zustand store | `useChat.setMessages([])` called from Sidebar |
| sidebar, auth, history, loginModal | Zustand store | Zustand store (unchanged) |

---

## Files Changed

### New
- `src/app/api/chat/route.ts` — POST endpoint, calls OpenRouter, returns streaming response

### Modified
- `src/app/chat/page.tsx` — already has `'use client'`. Initializes `useChat`, passes `messages`/`status`/`append`/`setMessages` to `ChatWindow` and `setMessages` to `Sidebar` as props.
- `src/components/chat/ChatWindow.tsx` — accepts `messages`, `status`, `append` as props instead of reading from store. Removes `sendMessage` store import.
- `src/components/chat/Sidebar.tsx` — "New Chat" button currently calls `newChat()` from the store. After migration it will call a `onNewChat` prop (which invokes `useChat.setMessages([])`).
- `src/lib/store.ts` — remove `messages`, `isLoading`, `addMessage`, `setMessages`, `setLoading`, `sendMessage`, `newChat`. Keep all other state (sidebar, auth, history, loginModal, title, matchCount).

### Unchanged
- `src/components/chat/InputBar.tsx` — already accepts `onSend` + `disabled` as props
- `src/components/chat/MessageBubble.tsx` — see type note below

---

## Message Type Reconciliation

The existing `MessageBubble.tsx` defines its own local `Message` type. The Vercel AI SDK exports its own `Message` type from `'ai'`.

**Decision:** Replace the local `Message` type in `MessageBubble.tsx` with the SDK's `Message` type (`import type { Message } from 'ai'`). The SDK's type has `id`, `role`, and `content` fields which are all the current code uses. Any future extra fields (e.g. `listings`) can be added via a local extension type wrapping the SDK type.

---

## ChatWindow Props

```ts
interface ChatWindowProps {
  messages: Message[]        // from 'ai'
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  append: (msg: { role: 'user'; content: string }) => void
}
```

`isLoading` from the store is replaced by `status` from `useChat`. The three-dot bounce indicator shows only when `status === 'submitted'` (request in flight, no tokens yet). Once streaming starts (`status === 'streaming'`), the bounce indicator is hidden — the assistant message is already updating in real time.

---

## Sidebar Props

```ts
interface SidebarProps {
  onNewChat: () => void   // calls useChat.setMessages([])
}
```

---

## API Route

**`POST /api/chat`**

Request body:
```json
{ "messages": [{ "role": "user", "content": "..." }] }
```

Implementation:
- Uses `@ai-sdk/openai` `createOpenAI` with `baseURL: 'https://openrouter.ai/api/v1'`
- API key from `process.env.OPEN_ROUTER_KEY`
- Model: `anthropic/claude-haiku-3-5`
- Returns `streamText(...).toDataStreamResponse()`

System prompt:
```
You are Huisly, a conversational housing agent for the Netherlands.
Help users find rental housing. Ask about city, budget, move date, and preferences.
Keep responses concise and warm. Respond in plain text only (no markdown).
```

Error handling:
- Missing `OPEN_ROUTER_KEY` → 500
- OpenRouter error → forward status code
- No auth guard (chat available to unauthenticated users per product spec)

---

## New Dependencies

```
ai
@ai-sdk/openai
```

---

## Out of Scope

- Chat history persistence (Supabase)
- Auth gating on the chat route
- Streaming UI components (ListingCard, EmailPreview, etc.)
- Preference extraction / intent routing
