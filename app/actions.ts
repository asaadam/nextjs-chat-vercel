'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const data = await fetch(
      `https://vercel-ai-mf6v.onrender.com/api/chat?id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then(res => res.json())
    console.log('data', data)
    return data as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const data = await fetch(
    `https://vercel-ai-mf6v.onrender.com/api/chat/${id}?userId=${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ).then(res => res.json())

  return data as Chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  await fetch(`https://vercel-ai-mf6v.onrender.com/api/chat/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({
      userId: session.user.id
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await fetch(`https://vercel-ai-mf6v.onrender.com/api/chat`, {
    method: 'DELETE',
    body: JSON.stringify({
      userId: session.user.id
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await fetch(
    `https://vercel-ai-mf6v.onrender.com/api/chat/shared/${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ).then(res => res.json())

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(chat: Chat) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const payload = {
    ...chat,
    chatId: chat.id,
    userId: session.user.id
  }
  await fetch(`https://vercel-ai-mf6v.onrender.com/api/chat/share`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())

  return payload
}
