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

-- Başlangıç verisi - Genel kanal
INSERT INTO public.rooms (name, description, created_by) 
VALUES ('genel', 'Genel sohbet kanalı', 'system')
ON CONFLICT DO NOTHING;

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at);
