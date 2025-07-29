'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testSupabase()
  }, [])

  const testSupabase = async () => {
    try {
      console.log('Testing Supabase connection...')
      
      // Basit bir test sorgusu
      const { data, error } = await supabase
        .from('rooms')
        .select('count(*)')
        .single()

      console.log('Test result:', { data, error })
      
      if (error) {
        setTestResult({ success: false, error: error.message })
      } else {
        setTestResult({ success: true, data })
      }
    } catch (error) {
      console.error('Test error:', error)
      setTestResult({ success: false, error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const createTestTable = async () => {
    try {
      const { data, error } = await supabase.rpc('create_test_table')
      console.log('Create table result:', { data, error })
    } catch (error) {
      console.error('Create table error:', error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Anadolux - Supabase Test</h1>
      
      {loading ? (
        <p>Testing connection...</p>
      ) : (
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Test Result:</h2>
            <pre className="mt-2 text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
          
          <button 
            onClick={testSupabase}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Again
          </button>
          
          <button 
            onClick={createTestTable}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
          >
            Create Test Table
          </button>
        </div>
      )}
    </div>
  )
}
