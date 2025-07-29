-- RLS (Row Level Security) etkinleştir
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rooms tablosu için politikalar (önce sil, sonra oluştur)
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
