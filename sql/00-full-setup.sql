-- 1. TABLOLAR
-- ===========

-- Rooms (Odalar/Kanallar) tablosu
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Messages (Mesajlar) tablosu
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles (Kullanıcı Profilleri) tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GÜVENLİK POLİTİKALARI (RLS)
-- ===============================

-- RLS (Row Level Security) etkinleştir
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rooms tablosu için politikalar
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
CREATE POLICY "Anyone can view rooms" ON public.rooms
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert rooms" ON public.rooms;
CREATE POLICY "Authenticated users can insert rooms" ON public.rooms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages tablosu için politikalar
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
CREATE POLICY "Anyone can view messages" ON public.messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;
CREATE POLICY "Authenticated users can insert messages" ON public.messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Profiles tablosu için politikalar
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. REALTIME AYARLARI
-- ====================

-- Realtime için tabloları etkinleştir (hata görmezden gel)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
    EXCEPTION WHEN duplicate_object THEN
        -- Tablo zaten ekli, devam et
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN
        -- Tablo zaten ekli, devam et
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    EXCEPTION WHEN duplicate_object THEN
        -- Tablo zaten ekli, devam et
    END;
END $$;

-- 4. BAŞLANGIÇ VERİSİ
-- ===================

-- Genel kanal oluştur
INSERT INTO public.rooms (name, description, created_by) 
VALUES ('genel', 'Anadolux Genel Sohbet Kanalı', 'system')
ON CONFLICT DO NOTHING;

-- Duyurular kanalı oluştur
INSERT INTO public.rooms (name, description, created_by) 
VALUES ('duyurular', 'Önemli duyurular ve haberler', 'system')
ON CONFLICT DO NOTHING;

-- 5. İNDEKSLER (PERFORMANS)
-- =========================

-- Messages tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);

-- Rooms tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON public.rooms(created_by);

-- Profiles tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

