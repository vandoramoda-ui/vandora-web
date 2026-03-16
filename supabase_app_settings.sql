-- SQL to create app_settings table and initial configuration
-- Run this in your Supabase SQL Editor

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow anyone to read settings
DROP POLICY IF EXISTS "Public can read app_settings" ON public.app_settings;
CREATE POLICY "Public can read app_settings" ON public.app_settings
FOR SELECT USING (true);

-- Allow admins to manage settings
DROP POLICY IF EXISTS "Admins can manage app_settings" ON public.app_settings;
CREATE POLICY "Admins can manage app_settings" ON public.app_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'superadmin')
    )
);

-- 4. Insert default checkout configuration if it doesn't exist
INSERT INTO public.app_settings (key, value)
VALUES (
    'checkout_config',
    '{
        "fields": {
            "firstName": {"enabled": true, "required": true, "label": "Nombres"},
            "lastName": {"enabled": true, "required": true, "label": "Apellidos"},
            "phone": {"enabled": true, "required": true, "label": "Teléfono / WhatsApp"},
            "email": {"enabled": true, "required": true, "label": "Correo Electrónico"},
            "province": {"enabled": true, "required": true, "label": "Provincia"},
            "city": {"enabled": true, "required": true, "label": "Ciudad"},
            "sector": {"enabled": true, "required": true, "label": "Sector / Barrio"},
            "address": {"enabled": true, "required": true, "label": "Dirección Exacta"},
            "reference": {"enabled": true, "required": true, "label": "Referencia"},
            "company": {"enabled": true, "required": false, "label": "Empresa"},
            "address2": {"enabled": true, "required": false, "label": "Apartamento / Suite"},
            "postalCode": {"enabled": false, "required": false, "label": "Código Postal"}
        },
        "paymentMethods": {"transfer": true, "cash": true, "card": false},
        "transferDetails": "Banco Pichincha\\nCuenta Corriente: 1234567890\\nNombre: Vandora Moda\\nRUC: 1790000000001",
        "banks": [
            {"name": "Banco Pichincha", "details": "Cuenta Corriente: 1234567890\\nNombre: Vandora Moda\\nRUC: 1790000000001"},
            {"name": "Banco Guayaquil", "details": "Cuenta Ahorros: 0987654321\\nNombre: Vandora Moda\\nRUC: 1790000000001"}
        ],
        "shippingRules": {"freeShippingThreshold": 100, "codCities": ["Quito", "Guayaquil", "Cuenca"], "freeShippingCities": []}
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
