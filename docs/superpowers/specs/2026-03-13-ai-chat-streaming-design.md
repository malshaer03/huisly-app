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
                    streamText → StreamingTextResponse
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
| sidebar, auth, history, loginModal | Zustand store | Zustand store (unchanged) |

---

## Files Changed

### New
- `src/app/api/chat/route.ts` — POST endpoint, calls OpenRouter, returns streaming response

### Modified
- `src/app/chat/page.tsx` — initializes `useChat`, passes `messages`/`isLoading`/`append` to `ChatWindow`
- `src/components/chat/ChatWindow.tsx` — accepts props instead of reading messages/loading from store
- `src/lib/store.ts` — remove `messages`, `isLoading`, `addMessage`, `setMessages`, `setLoading`, `sendMessage`; keep all other state

### Unchanged
- `src/components/chat/InputBar.tsx` — already accepts `onSend` + `disabled` as props
- `src/components/chat/MessageBubble.tsx` — already accepts `message` as a prop

---

## API Route

**`POST /api/chat`**

Request body:
```json
{ "messages": [{ "role": "user", "content": "..." }] }
```

Implementation:
- Uses `@ai-sdk/openai` with `baseURL: https://openrouter.ai/api/v1`
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
- Missing API key → 500
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
- The `newChat` reset flow (no-op for now, handled by page reload)
