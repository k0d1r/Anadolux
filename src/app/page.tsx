'use client'

import Link from "next/link";
import { MessageCircle, Users, Zap, Shield, Globe, ArrowRight, User, LogOut } from "lucide-react";
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'

export default function Home() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Anadolux
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Hoş geldin, {user.firstName || user.username}!</span>
                <UserButton afterSignOutUrl="/" />
                <Link
                  href="/chat"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  Chat'e Git
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200">
                    Giriş Yap
                  </button>
                </SignInButton>
                <Link
                  href="/chat"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  Chat'e Başla
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Anadolu'nun Işığı
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Modern Türk
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Chat Deneyimi
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Gerçek zamanlı mesajlaşma, güvenli odalar ve Türk kullanıcılarına özel olarak tasarlanmış modern chat uygulaması.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <MessageCircle className="w-5 h-5" />
              Hemen Başla
            </Link>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200 text-lg font-semibold"
            >
              Özellikler
            </button>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Gerçek Zamanlı</h3>
            <p className="text-gray-600 leading-relaxed">
              Anlık mesajlaşma ve canlı güncellemeler ile kesintisiz iletişim deneyimi yaşayın.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Güvenli</h3>
            <p className="text-gray-600 leading-relaxed">
              Modern güvenlik protokolleri ile verileriniz her zaman korunur ve gizli kalır.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Topluluk</h3>
            <p className="text-gray-600 leading-relaxed">
              Farklı konularda odalar oluşturun ve benzer ilgi alanlarındaki kişilerle tanışın.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Anadolux'a Katılın</h2>
          <p className="text-purple-100 mb-8 text-lg max-w-2xl mx-auto">
            Türkiye'nin en modern chat platformunda yerinizi alın. Güvenli, hızlı ve kullanıcı dostu arayüz ile tanışın.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl hover:shadow-lg transition-all duration-200 text-lg font-semibold"
          >
            <Globe className="w-5 h-5" />
            Şimdi Başla
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Anadolux
              </span>
            </div>
            <p className="text-gray-500 text-center md:text-right">
              © 2025 Anadolux - Anadolu'nun Işığı. Modern Türk chat deneyimi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
