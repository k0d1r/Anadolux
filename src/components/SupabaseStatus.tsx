'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    tablesExist: boolean
    error?: string
    details?: any
  }>({
    connected: false,
    tablesExist: false
  })

  useEffect(() => {
    checkSupabaseStatus()
  }, [])

  const checkSupabaseStatus = async () => {
    try {
      console.log('🔍 Supabase durumu kontrol ediliyor...')
      
      // 1. Basit bağlantı testi - ping gibi
      const { data: healthCheck, error: healthError } = await supabase
        .rpc('version')

      if (healthError) {
        console.log('RPC test başarısız, alternatif test deneniyor...')
        
        // Alternatif test - boş tablo sorgusu
        const { data: altTest, error: altError } = await supabase
          .from('rooms')
          .select('id')
          .limit(1)

        if (altError && altError.code === 'PGRST116') {
          setStatus({
            connected: true,
            tablesExist: false,
            error: 'Tablolar bulunamadı - SQL scriptini çalıştırın',
            details: altError
          })
          return
        } else if (altError) {
          setStatus({
            connected: false,
            tablesExist: false,
            error: `Bağlantı hatası: ${altError.message}`,
            details: altError
          })
          return
        }
      }

      // 2. Rooms tablosu var mı kontrol et
      const { data: roomsCheck, error: roomsError } = await supabase
        .from('rooms')
        .select('id')
        .limit(1)

      if (roomsError) {
        if (roomsError.code === 'PGRST116' || roomsError.message?.includes('does not exist')) {
          setStatus({
            connected: true,
            tablesExist: false,
            error: 'Tablolar bulunamadı - SQL scriptini çalıştırın',
            details: roomsError
          })
        } else {
          setStatus({
            connected: false,
            tablesExist: false,
            error: `Bilinmeyen hata: ${roomsError.message}`,
            details: roomsError
          })
        }
        return
      }

      // 3. Her şey OK
      setStatus({
        connected: true,
        tablesExist: true
      })

    } catch (error) {
      setStatus({
        connected: false,
        tablesExist: false,
        error: `Beklenmeyen hata: ${error}`,
        details: error
      })
    }
  }

  const createTables = async () => {
    try {
      // Temel rooms tablosu oluştur
      const { error } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.rooms (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by VARCHAR(255) NOT NULL
          );
        `
      })

      if (error) {
        console.error('Tablo oluşturma hatası:', error)
      } else {
        console.log('✅ Rooms tablosu oluşturuldu')
        checkSupabaseStatus() // Durumu yenile
      }
    } catch (error) {
      console.error('Tablo oluşturma hatası:', error)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-semibold mb-2">🔌 Supabase Durumu</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Bağlantı: {status.connected ? 'Başarılı' : 'Başarısız'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${status.tablesExist ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span>Tablolar: {status.tablesExist ? 'Mevcut' : 'Eksik'}</span>
        </div>

        {status.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
            <div className="font-medium">Hata:</div>
            <div className="text-xs mt-1">{status.error}</div>
          </div>
        )}

        {!status.tablesExist && status.connected && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="text-yellow-800 text-xs">
              <strong>Çözüm:</strong> Supabase Dashboard &gt; SQL Editor&apos;da şu dosyaları çalıştırın:
              <br />• sql/01-create-tables.sql
              <br />• sql/02-security-policies.sql  
              <br />• sql/03-realtime-and-data.sql
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={checkSupabaseStatus}
        className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
      >
        🔄 Yenile
      </button>
    </div>
  )
}
