'use client'

import { useEffect, useState } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { supabase, type Room, type Message } from '@/lib/supabase'
import { Plus, Hash, Users, Send, Loader2 } from 'lucide-react'
import SupabaseStatus from '@/components/SupabaseStatus'

export default function ChatPage() {
  const { user } = useUser()
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Odaları yükle
  useEffect(() => {
    loadRooms()
  }, [])

  // Seçili odanın mesajlarını yükle
  useEffect(() => {
    if (currentRoom) {
      loadMessages(currentRoom.id)
      subscribeToMessages(currentRoom.id)
    }
  }, [currentRoom])

  const loadRooms = async () => {
    try {
      console.log('🔍 Supabase bağlantısı test ediliyor...')
      console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('🔑 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: true })

      console.log('📦 Supabase yanıtı:', { 
        data, 
        error: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null 
      })

      if (error) {
        console.error('❌ Supabase hatası:', error)
        // Eğer tablo yoksa, kullanıcıya bilgi ver
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.error('🚨 TABLO BULUNAMADI! Supabase SQL scriptlerini çalıştırmanız gerekiyor.')
        }
        throw error
      }
      
      console.log('✅ Odalar başarıyla yüklendi:', data?.length || 0)
      setRooms(data || [])
      
      // İlk odayı seç
      if (data && data.length > 0 && !currentRoom) {
        setCurrentRoom(data[0])
      }
    } catch (error) {
      console.error('💥 Error loading rooms:', error)
      // Kullanıcı dostu hata mesajı
      if (error instanceof Error) {
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.error('🔧 Çözüm: sql/ klasöründeki SQL dosyalarını Supabase Dashboard > SQL Editor\'da çalıştırın')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const subscribeToMessages = (roomId: string) => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const createRoom = async () => {
    if (!newRoomName.trim() || !user) return

    try {
      console.log('🏗️ Yeni oda oluşturuluyor:', newRoomName)
      
      const { data, error } = await supabase
        .from('rooms')
        .insert([
          {
            name: newRoomName,
            created_by: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('❌ Oda oluşturma hatası:', error)
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          alert(`🚨 TABLOLAR BULUNAMADI!

Çözüm: BASIT_KURULUM.sql dosyasını Supabase Dashboard > SQL Editor'da çalıştırın.`)
        } else {
          alert(`Oda oluşturma hatası: ${error.message}`)
        }
        throw error
      }

      console.log('✅ Oda başarıyla oluşturuldu:', data)
      setRooms(prev => [...prev, data])
      setNewRoomName('')
      setShowCreateRoom(false)
      setCurrentRoom(data)
    } catch (error) {
      console.error('💥 Error creating room:', error)
    }
  }

const sendMessage = async () => {
  if (!newMessage.trim() || !currentRoom || !user) return

  try {
    console.log('📤 Mesaj gönderiliyor:', newMessage)
    
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content: newMessage,
          room_id: currentRoom.id,
          user_id: user.id,
          user_name: user.firstName || user.username || 'Anonim',
          user_image: user.imageUrl,
        },
      ])

    if (error) {
      console.error('❌ Mesaj gönderme hatası:', error)
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        alert(`🚨 TABLOLAR BULUNAMADI!

Çözüm: BASIT_KURULUM.sql dosyasını Supabase Dashboard > SQL Editor'da çalıştırın.`)
      } else {
        alert(`Mesaj gönderme hatası: ${error.message}`)
      }
      throw error
    }

    console.log('✅ Mesaj başarıyla gönderildi:')
    setNewMessage('')
  } catch (error) {
    console.error('💥 Error sending message:', error)
  }
}

const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <SupabaseStatus />
      {/* Sidebar - Odalar */}
      <div className="w-64 bg-purple-800 text-white flex flex-col">
        <div className="p-4 border-b border-purple-700">
          <h2 className="text-xl font-semibold">Anadolux</h2>
          <p className="text-purple-200 text-sm">Anadolu'nun Işığı - Hoş geldin, {user?.firstName}!</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-purple-200">Kanallar</h3>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="p-1 hover:bg-purple-700 rounded"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {showCreateRoom && (
              <div className="mb-4 p-3 bg-purple-700 rounded-lg">
                <input
                  type="text"
                  placeholder="Kanal adı..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full p-2 rounded bg-purple-600 text-white placeholder-purple-200 border-none outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && createRoom()}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={createRoom}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Oluştur
                  </button>
                  <button
                    onClick={() => setShowCreateRoom(false)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setCurrentRoom(room)}
                  className={`w-full text-left p-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 ${
                    currentRoom?.id === room.id ? 'bg-purple-700' : ''
                  }`}
                >
                  <Hash className="h-4 w-4" />
                  <span className="truncate">{room.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-purple-700">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">{rooms.length} kanal</span>
          </div>
        </div>
      </div>

      {/* Ana Chat Alanı */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-gray-600" />
                <h1 className="text-lg font-semibold">{currentRoom.name}</h1>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {message.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{message.user_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mesaj Yazma Alanı */}
            <div className="bg-white border-t p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder={`#${currentRoom.name} kanalına mesaj yazın...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Hash className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-medium mb-2">Kanal seçin</h2>
              <p>Mesajlaşmaya başlamak için sol taraftan bir kanal seçin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
